//src/core/logger.ts
export const logError = (location: string, err: unknown) => {
  console.error(`❌ Error in ${location}:`, err)
}