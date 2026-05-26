async function main() {
  console.log("Seeding database...");
  console.log("No seed data required — users auto-created on first dashboard visit.");
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
