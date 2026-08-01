/**
 * Parse OpenAI Responses API SSE stream format.
 * Extracts text deltas from event payloads.
 */
export async function* parseOpenAIStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line || line === "data: [DONE]") continue;

      const dataLine = line.match(/^data:\s*(.+)$/m)?.[1];
      if (!dataLine) continue;

      try {
        const json = JSON.parse(dataLine);
        const text =
          json?.delta ||
          json?.output_text?.delta ||
          json?.output?.text ||
          json?.choices?.[0]?.delta?.content ||
          json?.choices?.[0]?.message?.content ||
          "";

        if (typeof text === "string" && text) {
          yield text;
        }
      } catch {
        // Ignore malformed stream fragments.
      }
    }
  }

  if (buffer.trim() && buffer.trim() !== "data: [DONE]") {
    const dataLine = buffer.match(/^data:\s*(.+)$/m)?.[1];
    if (dataLine) {
      try {
        const json = JSON.parse(dataLine);
        const text =
          json?.delta ||
          json?.output_text?.delta ||
          json?.output?.text ||
          json?.choices?.[0]?.delta?.content ||
          json?.choices?.[0]?.message?.content ||
          "";

        if (typeof text === "string" && text) {
          yield text;
        }
      } catch {
        // Ignore malformed stream fragments.
      }
    }
  }
}
