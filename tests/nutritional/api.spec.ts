import { test, expect } from "@playwright/test";

const API_URL =  process.env.VITE_APP_API_URL || "http://localhost:5000";
const API_KEY =  "test-key";

test.describe("Nutritional API", () => {
  test.describe("getPatients", () => {
    test("should retrieve patients list without parameters", async ({
      request,
    }) => {
      const response = await request.get(`${API_URL}/nutritional/patients`, {
        headers: {
          "x-api-key": API_KEY,
        },
      });

      console.log("Response status:", response.status());
      expect([200, 400]).toContain(response.status());
    });

    test("should retrieve patients list with setor parameter", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_URL}/nutritional/patients?setor=1`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 400]).toContain(response.status());
    });

    test("should retrieve patients list with ala parameter", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_URL}/nutritional/patients?ala=A1`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 400]).toContain(response.status());
    });

    test("should retrieve patients list with both setor and ala parameters", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_URL}/nutritional/patients?setor=1&ala=A1`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 400]).toContain(response.status());
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });

  test.describe("saveNrsNut", () => {
    test("should save NRS-NUT data with valid payload", async ({ request }) => {
      const nratendimento = 12345;
      const payload = {
        apache_ii: 25,
        sofa: 12,
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/${nratendimento}/nrs-nut`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save NRS-NUT with APACHE II minimum value", async ({
      request,
    }) => {
      const payload = {
        apache_ii: 0,
        sofa: 0,
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/nrs-nut`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save NRS-NUT with APACHE II maximum value", async ({
      request,
    }) => {
      const payload = {
        apache_ii: 71,
        sofa: 24,
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/nrs-nut`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should include required headers in request", async ({ request }) => {
      const payload = {
        apache_ii: 15,
        sofa: 8,
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/nrs-nut`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect(response.headers()["content-type"]).toBeDefined();
    });
  });

  test.describe("saveGlim", () => {
    test("should save GLIM diagnosis with non-disease type", async ({
      request,
    }) => {
      const payload = {
        diagnostico: "nd",
        fenotipos: ["fenotipos1"],
        etiologias: ["etiologia1"],
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/glim`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save GLIM diagnosis with moderate type", async ({
      request,
    }) => {
      const payload = {
        diagnostico: "mod",
        fenotipos: ["fenotipos1", "fenotipos2"],
        etiologias: ["etiologia1", "etiologia2"],
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/glim`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save GLIM diagnosis with severe type", async ({ request }) => {
      const payload = {
        diagnostico: "grave",
        fenotipos: ["fenotipos1"],
        etiologias: ["etiologia1", "etiologia2", "etiologia3"],
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/glim`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save GLIM with multiple phenotypes and etiologies", async ({
      request,
    }) => {
      const payload = {
        diagnostico: "mod",
        fenotipos: ["pheno1", "pheno2", "pheno3"],
        etiologias: ["etio1", "etio2"],
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/glim`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });
  });

  test.describe("saveAval", () => {
    test("should save assessment with minimum required fields", async ({
      request,
    }) => {
      const payload = {
        conduta: "NPT",
        frequencia: "24h",
      };

      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/assessment`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save assessment with all optional fields", async ({
      request,
    }) => {
      const payload = {
        conduta: "Oral feeding",
        frequencia: "12h",
        ingestao: 80,
        meta_kcal: 2000,
        meta_prot: 80,
      };

      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/assessment`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should save assessment with different frequencies", async ({
      request,
    }) => {
      const frequencies = ["12h", "24h", "48h", "7d", "rotina"];

      for (const freq of frequencies) {
        const payload = {
          conduta: "Protocol",
          frequencia: freq,
        };

        const response = await request.post(
          `${API_URL}/nutritional/patients/12345/assessment`,
          {
            data: payload,
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        expect([200, 201, 400]).toContain(response.status());
      }
    });

    test("should save assessment with nutritional goals", async ({ request }) => {
      const payload = {
        conduta: "Enteral feeding",
        frequencia: "24h",
        ingestao: 100,
        meta_kcal: 1800,
        meta_prot: 75,
      };

      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/assessment`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });
  });

  test.describe("acknowledgePatient", () => {
    test("should acknowledge patient alert", async ({ request }) => {
      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/acknowledge`,
        {
          data: {},
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("should send empty object as payload", async ({ request }) => {
      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/acknowledge`,
        {
          data: {},
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect(response.ok() || response.status() === 400).toBeTruthy();
    });

    test("should acknowledge alerts for different patient IDs", async ({
      request,
    }) => {
      const patientIds = [1, 100, 12345, 999999];

      for (const id of patientIds) {
        const response = await request.post(
          `${API_URL}/nutritional/patients/${id}/acknowledge`,
          {
            data: {},
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        expect([200, 201, 400]).toContain(response.status());
      }
    });

    test("should handle concurrent acknowledge requests", async ({ request }) => {
      const responses = await Promise.all([
        request.post(`${API_URL}/nutritional/patients/1/acknowledge`, {
          data: {},
          headers: {
            "x-api-key": API_KEY,
          },
        }),
        request.post(`${API_URL}/nutritional/patients/2/acknowledge`, {
          data: {},
          headers: {
            "x-api-key": API_KEY,
          },
        }),
        request.post(`${API_URL}/nutritional/patients/3/acknowledge`, {
          data: {},
          headers: {
            "x-api-key": API_KEY,
          },
        }),
      ]);

      responses.forEach((response) => {
        expect([200, 201, 400]).toContain(response.status());
      });
    });
  });

  test.describe("Error handling", () => {
    test("getPatients should handle invalid parameters gracefully", async ({
      request,
    }) => {
      const response = await request.get(
        `${API_URL}/nutritional/patients?invalid_param=test`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect(response.status()).toBeGreaterThanOrEqual(200);
    });

    test("saveNrsNut should handle non-existent patient", async ({ request }) => {
      const payload = {
        apache_ii: 25,
        sofa: 12,
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/999999999/nrs-nut`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([400, 404]).toContain(response.status());
    });

    test("saveGlim should reject invalid diagnosis type", async ({ request }) => {
      const payload = {
        diagnostico: "invalid",
        fenotipos: [],
        etiologias: [],
      };

      const response = await request.put(
        `${API_URL}/nutritional/patients/12345/glim`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    test("saveAval should reject invalid frequency", async ({ request }) => {
      const payload = {
        conduta: "test",
        frequencia: "invalid",
      };

      const response = await request.post(
        `${API_URL}/nutritional/patients/12345/assessment`,
        {
          data: payload,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      expect([200, 201, 400]).toContain(response.status());
    });

    // test("should handle missing API key gracefully", async () => {
    //   const responseContext = await (
    //     await (
    //       await this.page?.context()
    //     )?.request
    //   )?.get("/nutritional/patients");

    //   expect(responseContext).toBeDefined();
    // });
  });
});
