describe('Gestión de Categorías - Caso automatizado completo (checklist)', () => {
  const apiUrl = 'http://localhost:3001/api'
  const nombreNuevo = 'ChecklistExitoso01'
  const colorNuevo = '#1A2B3C' // -> rgb(26, 43, 60), usado en la aserción de background-color
  const EXPECTED_PAGE_TITLE = 'FinanzaPro'
  const EXPECTED_HEADING_FONT_FAMILY = 'Inter, sans-serif'
  const EXPECTED_HEADING_COLOR = 'rgb(15, 23, 41)'

  // Limpieza: borra solo las categorías cuyo nombre empieza con "Checklist"
  const cleanChecklist = () => {
    cy.request(`${apiUrl}/categories`).then(({ body }) => {
      body
        .filter((c) => c.name.startsWith('Checklist'))
        .forEach((c) => cy.request('DELETE', `${apiUrl}/categories/${c.id}`))
    })
  }

  before(cleanChecklist)
  after(cleanChecklist)

  it('CP-CHK-CAT-01 - navegación, elementos, dropdown de tipo, creación exitosa y nombre obligatorio', () => {
    cy.intercept('POST', '**/api/categories').as('crearCategoria')

    // Paso 1: navegar a la URL de categorías
    cy.visit('/categories')

    // Paso 2: aserción de URL exacta
    cy.url().should('eq', 'http://localhost:5173/categories')

    // Paso 3: aserción de título de página exacto
    cy.title().should('eq', EXPECTED_PAGE_TITLE)

    // Paso 4: elementos de navegación presentes (menú)
    cy.get('a[href="/"]').should('exist')
    cy.get('a[href="/movements"]').should('exist')
    cy.get('a[href="/categories"]').should('exist')
    cy.get('a[href="/profile"]').should('exist')

    // Paso 5: texto y elementos presentes en el encabezado
    cy.get('h1').should('contain.text', 'Categorías')
    cy.contains('p', 'Gestiona tus categorías de ingresos y gastos').should('be.visible')

    // Paso 6: estilos CSS sobre el encabezado
    cy.get('h1').should('have.css', 'font-family', EXPECTED_HEADING_FONT_FAMILY)
    cy.get('h1').should('have.css', 'color', EXPECTED_HEADING_COLOR)

    // Paso 7: botón presente + click para abrir el formulario
    cy.contains('button', 'Nueva Categoría').should('be.visible').click()

    // Paso 8: título del diálogo y campos del formulario
    cy.contains('Crear nueva categoría').should('be.visible')
    cy.get('input[placeholder="Ej. Viajes"]').should('exist')
    cy.get('[role="combobox"]').should('exist')
    cy.get('.flex.gap-2 input[type="text"]').should('exist')
    cy.get('.flex.gap-2 input[type="color"]').should('exist')

    // Paso 9: contenido del dropdown "Tipo" y selección de una opción
    cy.get('[role="combobox"]').click()
    cy.get('[role="option"]').should('have.length', 3)
    cy.get('[role="option"]').eq(0).should('contain.text', 'Ingreso')
    cy.get('[role="option"]').eq(1).should('contain.text', 'Gasto')
    cy.get('[role="option"]').eq(2).should('contain.text', 'Ambos')
    cy.contains('[role="option"]', 'Gasto').click()

    // Paso 10: llenado de formulario
    cy.get('input[placeholder="Ej. Viajes"]').type(nombreNuevo)
    cy.get('.flex.gap-2 input[type="text"]').clear().type(colorNuevo)

    // Paso 11: guardar + mensaje de éxito
    cy.contains('button', 'Guardar').click()
    cy.wait('@crearCategoria')
    cy.contains('Categoría creada correctamente').should('be.visible')
    cy.screenshot('02_exito_creacion')

    // Paso 12: estilo CSS (background-color) de la categoría recién creada
    cy.contains('h3', nombreNuevo)
      .parents('div.p-6')
      .find('div.rounded-full')
      .should('have.css', 'background-color', 'rgb(26, 43, 60)')

    // Paso 13: reabrir el formulario
    cy.contains('button', 'Nueva Categoría').click()
    cy.contains('Crear nueva categoría').should('be.visible')

    // Paso 14: guardar sin escribir nada -> mensaje de campo obligatorio y diálogo abierto
    cy.contains('button', 'Guardar').click()
    cy.contains('El nombre es obligatorio').should('be.visible')
    cy.contains('Crear nueva categoría').should('be.visible')
    cy.screenshot('03_error_nombre_obligatorio')
  })
})
