describe('Gestión de Categorías - Nombre duplicado', () => {
  const apiUrl = 'http://localhost:3001/api'
  const nombreDuplicado = 'ChecklistDuplicada01'

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

  it('CP-CHK-CAT-02 - rechazo de nombre duplicado (defecto BUG-05-03)', () => {
    cy.request('POST', `${apiUrl}/categories`, { name: nombreDuplicado, type: 'expense', color: '#999999' })
    cy.intercept('POST', '**/api/categories').as('crearCategoria')

    cy.visit('/categories')
    cy.contains('button', 'Nueva Categoría').click()
    cy.get('input[placeholder="Ej. Viajes"]').type(nombreDuplicado)
    cy.contains('button', 'Guardar').click()
    cy.wait('@crearCategoria')
    cy.get('h3').filter(':contains("ChecklistDuplicada01")').should('have.length', 2)
    cy.screenshot('05_duplicado_aceptado')

    // Se espera que FALLE: la app no valida nombres duplicados (defecto BUG-05-03)
    cy.contains('Ya existe una categoría con ese nombre').should('be.visible')
  })
})
