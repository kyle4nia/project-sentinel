const fs = require("fs");
const path = require("path");

const profilesPath = path.join(__dirname, "../Backend/Data/profiles.json");

describe("Profiles JSON structure", () => {
  it("should load and contain at least one profile", () => {
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf8"));
    expect(Object.keys(profiles).length).toBeGreaterThan(0);
  });

  it("each profile should include required fields", () => {
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf8"));
    for (const [pubkey, profile] of Object.entries(profiles)) {
      expect(profile).toHaveProperty("username");
      expect(profile).toHaveProperty("bio");
      expect(profile).toHaveProperty("verification_level");
      expect(profile).toHaveProperty("kaspa_address");
    }
  });
});
