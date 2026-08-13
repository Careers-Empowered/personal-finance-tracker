import {
  pipeline,
  type TextGenerationPipeline,
} from '@huggingface/transformers';

import type { Category } from './categoryProvider';

let generator: TextGenerationPipeline | null = null;

let initializationPromise:
  | Promise<TextGenerationPipeline>
  | null = null;

// Load the Qwen3-0.6B model once and reuse it.
async function getGenerator(): Promise<TextGenerationPipeline> {
  if (generator) {
    return generator;
  }

  // Prevent multiple model downloads if requests happen at the same time.
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = pipeline(
    'text-generation',
    'onnx-community/Qwen3-0.6B-ONNX',
    {
      device: 'webgpu',
      dtype: 'q4f16',
    }
  ) as Promise<TextGenerationPipeline>;

  try {
    generator = await initializationPromise;
    return generator;
  } finally {
    initializationPromise = null;
  }
}

// Interface used by the category suggestion service.
export interface SLMProvider {
  suggestCategory(
    description: string,
    categories: Category[]
  ): Promise<string | null>;
}

// Qwen3-0.6B implementation.
export class QwenProvider implements SLMProvider {
  async suggestCategory(
    description: string,
    categories: Category[]
  ): Promise<string | null> {
    if (!description.trim()) {
      return null;
    }

    if (categories.length === 0) {
      return null;
    }

    const model = await getGenerator();

    const categoryNames = categories
      .map((category) => category.name)
      .join('\n');

    // Keep the prompt focused on transaction categorization.
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a financial transaction categorization system. Select exactly one category from the provided list.',
      },
      {
        role: 'user' as const,
        content: `
/no_think

Transaction:
${description}

Available categories:
${categoryNames}

Choose exactly one category from the available categories.
Never invent a category.
If none of the available categories is an appropriate match, choose Other.
Return only the exact category name.
`.trim(),
      },
    ];

    console.log('Calling Qwen with:', {
      description,
      categories,
    });

    // Run the transaction through Qwen.
    const output = await model(messages, {
      max_new_tokens: 64,
      do_sample: false,
    });

    console.log('Qwen raw output:', output);

    return extractGeneratedText(output);
  }
}

// Get the assistant response from the model output.
function extractGeneratedText(
  output: unknown
): string | null {
  if (!Array.isArray(output) || output.length === 0) {
    return null;
  }

  const first = output[0] as {
    generated_text?: unknown;
  };

  const generatedText = first?.generated_text;

  // Qwen returns generated_text as chat messages.
  if (Array.isArray(generatedText)) {
    const assistantMessage = generatedText
      .filter(
        (
          message
        ): message is {
          role?: string;
          content?: string;
        } =>
          typeof message === 'object' &&
          message !== null
      )
      .find(
        (message) => message.role === 'assistant'
      );

    if (assistantMessage?.content) {
      console.log(
        'Qwen assistant response:',
        assistantMessage.content
      );

      return cleanModelResponse(
        assistantMessage.content
      );
    }
  }

  // Handle a plain string response as a fallback.
  if (typeof generatedText === 'string') {
    console.log(
      'Qwen string response:',
      generatedText
    );

    return cleanModelResponse(generatedText);
  }

  console.warn(
    'Could not extract Qwen generated text:',
    output
  );

  return null;
}

// Remove thinking content and simple output prefixes.
function cleanModelResponse(
  response: string
): string | null {
  let cleaned = response.trim();

  cleaned = cleaned.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ''
  );

  // Remove an incomplete thinking block.
  cleaned = cleaned.replace(
    /<think>[\s\S]*$/gi,
    ''
  );

  cleaned = cleaned.trim();

  if (!cleaned) {
    return null;
  }

  cleaned = cleaned
    .replace(/^category\s*:\s*/i, '')
    .replace(/^answer\s*:\s*/i, '')
    .trim();

  return cleaned || null;
}