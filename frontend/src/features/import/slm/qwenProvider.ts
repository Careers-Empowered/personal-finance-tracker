import {
  pipeline,
  type TextGenerationPipeline,
} from '@huggingface/transformers';

import type { SLMCategory } from './slmCategories';

let generator: TextGenerationPipeline | null = null;

let initializationPromise:
  | Promise<TextGenerationPipeline>
  | null = null;

// Load Qwen3-0.6B only once.
async function getGenerator(): Promise<TextGenerationPipeline> {
  if (generator) {
    return generator;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  // Prefer WebGPU for browser inference.
  let device = 'wasm';
  let dtype = 'q8';

  try {
    const gpu = (navigator as any).gpu;

    if (gpu) {
      const adapter = await gpu.requestAdapter();

      if (adapter) {
        device = 'webgpu';
        dtype = 'q4f16';

        console.log(
          `SLM: WebGPU supported! Using device: ${device}, dtype: ${dtype}`
        );
      }
    }
  } catch (error) {
    console.warn(
      'WebGPU check failed, falling back to WASM/CPU:',
      error
    );
  }

  if (device === 'wasm') {
    console.log(
      'SLM: WebGPU is not supported. Running model on CPU (WASM).'
    );
  }

  console.log('SLM: Loading Qwen3-0.6B...');

  initializationPromise = pipeline(
    'text-generation',
    'onnx-community/Qwen3-0.6B-ONNX',
    {
      device: device as any,
      dtype: dtype as any,
    }
  ) as Promise<TextGenerationPipeline>;

  try {
    generator = await initializationPromise;

    console.log(
      'SLM: Qwen3-0.6B loaded successfully.'
    );

    return generator;
  } finally {
    initializationPromise = null;
  }
}

// SLM provider interface.
export interface SLMProvider {
  suggestCategory(
    description: string,
    categories: SLMCategory[],
    type: 'income' | 'expense'
  ): Promise<string | null>;
}

// Qwen3-0.6B provider.
export class QwenProvider implements SLMProvider {
  async suggestCategory(
    description: string,
    categories: SLMCategory[],
    type: 'income' | 'expense'
  ): Promise<string | null> {
    if (!description.trim()) {
      return null;
    }

    if (categories.length === 0) {
      return null;
    }

    // Only provide categories that belong to
    // the current transaction type.
    const relevantCategories = categories.filter(
      (category) => category.type === type
    );

    if (relevantCategories.length === 0) {
      return null;
    }

    const model = await getGenerator();

    const categoryNames = relevantCategories
      .map((category) => category.name)
      .join('\n');

    /*
     * The SLM performs the actual categorization.
     * There are no keyword-based category mappings.
     */
    const messages = [
      {
        role: 'system' as const,
        content: `
/no_think

You are a financial transaction categorization system.

Understand the complete meaning and context of the
transaction description.

Choose exactly ONE category from the provided list.

The category must match the transaction type.

Never invent a category.
Never return an explanation.
Never return multiple categories.
Never return "Expense" or "Income".

Return ONLY the exact category name.
`.trim(),
      },

      {
        role: 'user' as const,
        content: `
Transaction description:
${description}

Transaction type:
${type}

Available categories:
${categoryNames}

Determine what this transaction is actually about.

Choose the single category that best represents
the transaction.

Return ONLY the exact category name.
`.trim(),
      },
    ];

    console.log(
      'Sending description to Qwen:',
      description
    );

    console.log(
      'Transaction type:',
      type
    );

    console.log(
      'Available categories:',
      relevantCategories
    );

    const output = await model(messages, {
      max_new_tokens: 16,
      do_sample: false,
    });

    console.log(
      'Qwen raw output:',
      output
    );

    return extractGeneratedText(output);
  }
}

// Extract the generated response.
function extractGeneratedText(
  output: unknown
): string | null {
  if (
    !Array.isArray(output) ||
    output.length === 0
  ) {
    console.warn(
      'Qwen returned an empty output.'
    );

    return null;
  }

  const first = output[0] as {
    generated_text?: unknown;
  };

  const generatedText =
    first?.generated_text;

  // Chat-format response.
  if (Array.isArray(generatedText)) {
    const assistantMessage =
      generatedText
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
          (message) =>
            message.role === 'assistant'
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

  // String-format response.
  if (typeof generatedText === 'string') {
    console.log(
      'Qwen string response:',
      generatedText
    );

    return cleanModelResponse(
      generatedText
    );
  }

  console.warn(
    'Could not extract Qwen generated text:',
    output
  );

  return null;
}

// Clean the model response.
function cleanModelResponse(
  response: string
): string | null {
  let cleaned = response.trim();

  // Remove Qwen thinking blocks.
  cleaned = cleaned.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ''
  );

  // Remove incomplete thinking blocks.
  cleaned = cleaned.replace(
    /<think>[\s\S]*$/gi,
    ''
  );

  // Remove common prefixes.
  cleaned = cleaned
    .replace(
      /^category\s*:\s*/i,
      ''
    )
    .replace(
      /^answer\s*:\s*/i,
      ''
    )
    .trim();

  // Keep only the first non-empty line.
  cleaned =
    cleaned
      .split('\n')
      .map((line) => line.trim())
      .find(
        (line) => line.length > 0
      ) ?? '';

  // Remove surrounding punctuation.
  cleaned = cleaned
    .replace(
      /^[`"'*]+|[`"'*.]+$/g,
      ''
    )
    .trim();

  console.log(
    'Qwen cleaned response:',
    cleaned
  );

  return cleaned || null;
}