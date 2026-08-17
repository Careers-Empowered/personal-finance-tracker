import {
  pipeline,
  type TextGenerationPipeline,
} from '@huggingface/transformers';

import type { SLMCategory } from './slmCategories';

let generator: TextGenerationPipeline | null = null;

let initializationPromise:
  | Promise<TextGenerationPipeline>
  | null = null;

async function getGenerator(): Promise<TextGenerationPipeline> {
  if (generator) {
    return generator;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  // Detect WebGPU & shader-f16 support
  let device = 'wasm';
  let dtype = 'q8'; // Safe fallback for WASM / CPU

  try {
    const gpu = (navigator as any).gpu;
    if (gpu) {
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        const hasFP16 = adapter.features.has('shader-f16');
        device = 'webgpu';
        dtype = hasFP16 ? 'q4f16' : 'q4';
        console.log(`SLM: WebGPU supported! Using device: ${device}, dtype: ${dtype}`);
      }
    }
  } catch (e) {
    console.warn('WebGPU check failed, falling back to WASM/CPU:', e);
  }

  if (device === 'wasm') {
    console.log('SLM: WebGPU is not supported. Running model on CPU (WASM).');
  }

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
    return generator;
  } finally {
    initializationPromise = null;
  }
}

export interface SLMProvider {
  suggestCategory(
    description: string,
    categories: SLMCategory[]
  ): Promise<string | null>;
}

export class QwenProvider implements SLMProvider {
  async suggestCategory(
    description: string,
    categories: SLMCategory[]
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

    const messages = [
      {
        role: 'system' as const,
        content: `
You are a financial transaction categorization system.

Read the complete transaction description and determine
the most appropriate category.

Choose exactly ONE category from the provided list.

Never invent a category.
Never return an explanation.
Never return "Expense" or "Income".
Never return multiple categories.

Return ONLY the exact category name.
`.trim(),
      },
      {
        role: 'user' as const,
        content: `
/no_think

Transaction description:
${description}

Available categories:
${categoryNames}

Choose the most appropriate category.

Return ONLY the exact category name.
`.trim(),
      },
    ];

    console.log('Sending description to Qwen:', description);
    console.log('Available categories:', categories);

    const output = await model(messages, {
      max_new_tokens: 16,
      do_sample: false,
    });

    console.log('Qwen raw output:', output);

    return extractGeneratedText(output);
  }
}

function extractGeneratedText(
  output: unknown
): string | null {
  if (
    !Array.isArray(output) ||
    output.length === 0
  ) {
    return null;
  }

  const first = output[0] as {
    generated_text?: unknown;
  };

  const generatedText = first?.generated_text;

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

function cleanModelResponse(
  response: string
): string | null {
  let cleaned = response.trim();

  // Remove Qwen thinking content.
  cleaned = cleaned.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ''
  );

  // Remove incomplete thinking content.
  cleaned = cleaned.replace(
    /<think>[\s\S]*$/gi,
    ''
  );

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

  // Keep first non-empty line.
  cleaned =
    cleaned
      .split('\n')
      .map((line) => line.trim())
      .find(
        (line) => line.length > 0
      ) ?? '';

  // Remove simple surrounding punctuation.
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