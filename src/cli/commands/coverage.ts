import { Command } from "commander";
// coverage 커맨드는 Phase 6에서 완성
export const coverageCommand = new Command("coverage")
  .description("Check documentation coverage (coming soon)")
  .argument("[path]", "Source directory path", "./src")
  .action(() => {
    console.log("Coverage command - coming in Phase 6");
  });
