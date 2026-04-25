import { test, expect } from "@playwright/test";

/**
 * US-FE-05: Entrada manual APACHE/SOFA + bloqueio Reconhecer
 * 
 * Testa o comportamento do formulário de entrada manual de APACHE II e SOFA,
 * o bloqueio do botão "Reconhecer" quando dados estão incompletos, e o 
 * desbloqueio após preenchimento dos valores.
 */

test.describe("mNUTRIC Manual Input - US-FE-05", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navega para o painel nutricional
    await page.goto("/nutricional");
    await expect(page.getByText("Painel Nutricional")).toBeVisible();
  });

  test("should block 'Reconhecer' button when dados_incompletos=true", async ({ page }) => {
    // Procurar um paciente de UTI com dados incompletos
    // Verificar se existe badge "⚠️ APACHE/SOFA necessários"
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    // Se não houver pacientes com dados incompletos, skip test
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    // Clica no primeiro paciente com dados incompletos
    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    // Verifica que o modal abriu
    await expect(page.locator(".ant-modal")).toBeVisible();

    // Verifica que o botão "Reconhecer" está desabilitado
    const reconhecerButton = page.getByRole("button", { name: "Reconhecer" });
    await expect(reconhecerButton).toBeDisabled();

    // Verifica tooltip do botão
    await reconhecerButton.hover();
    await expect(page.getByText("Insira APACHE II e SOFA para reconhecer")).toBeVisible();
  });

  test("should display manual form when dados_incompletos=true", async ({ page }) => {
    // Procurar um paciente de UTI com dados incompletos
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    // Clica no primeiro paciente com dados incompletos
    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    // Verifica que o formulário manual está visível
    await expect(page.getByText("APACHE II e SOFA não encontrados no sistema")).toBeVisible();
    await expect(page.getByText("Insira manualmente:")).toBeVisible();

    // Verifica campos do formulário
    const apacheInput = page.getByLabel(/APACHE II/);
    const sofaInput = page.getByLabel(/SOFA/);
    
    await expect(apacheInput).toBeVisible();
    await expect(sofaInput).toBeVisible();

    // Verifica que o botão "Calcular mNUTRIC" está desabilitado inicialmente
    const calcularButton = page.getByRole("button", { name: "Calcular mNUTRIC" });
    await expect(calcularButton).toBeDisabled();
  });

  test("should validate APACHE II range (0-71)", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    const apacheInput = page.getByLabel(/APACHE II/);

    // Testa valor mínimo válido
    await apacheInput.fill("0");
    await expect(apacheInput).toHaveValue("0");

    // Testa valor máximo válido
    await apacheInput.fill("71");
    await expect(apacheInput).toHaveValue("71");

    // Testa valor intermediário válido
    await apacheInput.fill("25");
    await expect(apacheInput).toHaveValue("25");
  });

  test("should validate SOFA range (0-24)", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    const sofaInput = page.getByLabel(/SOFA/);

    // Testa valor mínimo válido
    await sofaInput.fill("0");
    await expect(sofaInput).toHaveValue("0");

    // Testa valor máximo válido
    await sofaInput.fill("24");
    await expect(sofaInput).toHaveValue("24");

    // Testa valor intermediário válido
    await sofaInput.fill("12");
    await expect(sofaInput).toHaveValue("12");
  });

  test("should enable 'Calcular mNUTRIC' button when both fields are filled", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    const apacheInput = page.getByLabel(/APACHE II/);
    const sofaInput = page.getByLabel(/SOFA/);
    const calcularButton = page.getByRole("button", { name: "Calcular mNUTRIC" });

    // Inicialmente desabilitado
    await expect(calcularButton).toBeDisabled();

    // Preenche apenas APACHE
    await apacheInput.fill("25");
    await expect(calcularButton).toBeDisabled();

    // Preenche SOFA também
    await sofaInput.fill("12");
    await expect(calcularButton).toBeEnabled();
  });

  test("should save manual APACHE/SOFA and update Campo 1", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    const apacheInput = page.getByLabel(/APACHE II/);
    const sofaInput = page.getByLabel(/SOFA/);
    const calcularButton = page.getByRole("button", { name: "Calcular mNUTRIC" });

    // Preenche os valores
    await apacheInput.fill("30");
    await sofaInput.fill("15");

    // Setup response interceptor para verificar a chamada da API
    const responsePromise = page.waitForResponse(
      response => response.url().includes("/mnutric-manual") && response.request().method() === "PUT"
    );

    // Clica em Calcular
    await calcularButton.click();

    // Aguarda a resposta da API
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Verifica que o campo1 foi atualizado (badge deve desaparecer)
    await expect(page.getByText("⚠️ APACHE/SOFA necessários")).not.toBeVisible();
  });

  test("should enable 'Reconhecer' button after saving APACHE/SOFA", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    // Verifica que o botão Reconhecer está inicialmente desabilitado
    const reconhecerButton = page.getByRole("button", { name: "Reconhecer" });
    await expect(reconhecerButton).toBeDisabled();

    // Preenche e salva os valores
    const apacheInput = page.getByLabel(/APACHE II/);
    const sofaInput = page.getByLabel(/SOFA/);
    const calcularButton = page.getByRole("button", { name: "Calcular mNUTRIC" });

    await apacheInput.fill("28");
    await sofaInput.fill("10");
    await calcularButton.click();

    // Aguarda a atualização do estado
    await page.waitForResponse(
      response => response.url().includes("/mnutric-manual") && response.status() === 200
    );

    // Verifica que o botão Reconhecer foi habilitado
    await expect(reconhecerButton).toBeEnabled();
  });

  test("should preserve existing APACHE/SOFA values when present", async ({ page }) => {
    // Procura um paciente de UTI com valores já preenchidos (sem badge de dados incompletos)
    // Este teste verifica que o formulário mostra valores existentes quando aplicável
    
    // Clica em um paciente de UTI sem o badge de dados incompletos
    const utiPatient = page.locator('[data-testid="patient-card"]').filter({
      hasText: "UTI"
    }).filter({
      hasNotText: "⚠️ APACHE/SOFA necessários"
    }).first();

    const hasUtiPatient = await utiPatient.count();
    if (hasUtiPatient === 0) {
      test.skip();
      return;
    }

    await utiPatient.click();

    // Verifica que o formulário manual NÃO está visível
    await expect(page.getByText("APACHE II e SOFA não encontrados no sistema")).not.toBeVisible();
    
    // Verifica que o botão Reconhecer está habilitado
    const reconhecerButton = page.getByRole("button", { name: "Reconhecer" });
    await expect(reconhecerButton).toBeEnabled();
  });

  test("should display mNUTRIC score after calculation", async ({ page }) => {
    const apacheSofaBadge = page.getByText("⚠️ APACHE/SOFA necessários").first();
    
    const badgeCount = await apacheSofaBadge.count();
    if (badgeCount === 0) {
      test.skip();
      return;
    }

    const patientCard = page.locator('[data-testid="patient-card"]').filter({
      hasText: "⚠️ APACHE/SOFA necessários"
    }).first();
    
    await patientCard.click();

    // Preenche e salva os valores
    await page.getByLabel(/APACHE II/).fill("30");
    await page.getByLabel(/SOFA/).fill("15");
    await page.getByRole("button", { name: "Calcular mNUTRIC" }).click();

    // Aguarda a resposta da API
    await page.waitForResponse(
      response => response.url().includes("/mnutric-manual") && response.status() === 200
    );

    // Verifica que o score mNUTRIC é exibido (deve aparecer no painel de scores)
    await expect(page.getByText("mNUTRIC")).toBeVisible();
  });
});
