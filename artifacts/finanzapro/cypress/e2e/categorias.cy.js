describe('Gestión de Categorías - Pruebas de Caja Negra', () => {
  const apiUrl = 'http://localhost:3001/api'

  const openDialog = () => cy.contains('button', 'Nueva Categoría').click()
  const nameInput = () => cy.get('input[placeholder="Ej. Viajes"]')
  const colorInput = () => cy.get('.flex.gap-2 input[type="text"]')
  const save = () => cy.contains('button', 'Guardar').click()
  const expectCreated = () => cy.contains('Categoría creada correctamente')
  const expectFieldError = (msg) => cy.contains(msg)
  const deleteByName = (name) => cy.contains('h3', name).parents('div.p-6').find('button').click()

  beforeEach(() => {
    cy.visit('/categories')
  })

  describe('2. Partición de Equivalencia', () => {
    it('CP-PE-01 (CE1 Nombre 3-30) nombre válido -> categoría creada', () => {
      openDialog(); nameInput().type('Transporte'); save(); expectCreated()
    })

    it('CP-PE-02 (CE2 Nombre <3) no existe validación de longitud mínima -> se acepta (defecto de especificación)', () => {
      openDialog(); nameInput().type('Ta'); save(); expectCreated()
    })

    it('CP-PE-03 (CE3 Nombre >30) no existe validación de longitud máxima -> se acepta (defecto de especificación)', () => {
      openDialog(); nameInput().type('N'.repeat(31)); save(); expectCreated()
    })

    it('CP-PE-04 (CE4 Nombre vacío) rechazado por campo obligatorio', () => {
      openDialog(); save(); expectFieldError('El nombre es obligatorio')
    })

    it('CP-PE-05 (CE5 Color #RRGGBB válido) -> categoría creada', () => {
      openDialog(); nameInput().type('ColorValido01'); colorInput().clear().type('#1A2B3C'); save(); expectCreated()
    })

    it('CP-PE-06 (CE6 Color <6 dígitos) no existe validación de formato -> se acepta (defecto de especificación)', () => {
      openDialog(); nameInput().type('ColorCorto01'); colorInput().clear().type('#1A2B'); save(); expectCreated()
    })

    it('CP-PE-07 (CE7 Color >6 dígitos) no existe validación de formato -> se acepta (defecto de especificación)', () => {
      openDialog(); nameInput().type('ColorLargo01'); colorInput().clear().type('#1A2B3C4D'); save(); expectCreated()
    })

    it('CP-PE-08 (CE8 Color no hexadecimal) no existe validación de formato -> se acepta (defecto de especificación)', () => {
      openDialog(); nameInput().type('ColorNoHex01'); colorInput().clear().type('#GGGGGG'); save(); expectCreated()
    })

    it('CP-PE-09 (CE9 Color vacío) rechazado por campo obligatorio', () => {
      openDialog(); nameInput().type('ColorVacio01'); colorInput().clear(); save()
      expectFieldError('El color es obligatorio')
    })
  })

  describe('3. Análisis de Valores Límite', () => {
    it('CP-VL-01 Nombre 2 car. (fuera, inferior) -> sin regla, se acepta', () => {
      openDialog(); nameInput().type('Ta'); save(); expectCreated()
    })
    it('CP-VL-02 Nombre 3 car. (límite) -> se acepta', () => {
      openDialog(); nameInput().type('Tax'); save(); expectCreated()
    })
    it('CP-VL-03 Nombre 4 car. (dentro) -> se acepta', () => {
      openDialog(); nameInput().type('Taxi'); save(); expectCreated()
    })
    it('CP-VL-04 Nombre 29 car. (dentro) -> se acepta', () => {
      openDialog(); nameInput().type('N'.repeat(29)); save(); expectCreated()
    })
    it('CP-VL-05 Nombre 30 car. (límite) -> se acepta', () => {
      openDialog(); nameInput().type('N'.repeat(30)); save(); expectCreated()
    })
    it('CP-VL-06 Nombre 31 car. (fuera, superior) -> sin regla, se acepta', () => {
      openDialog(); nameInput().type('N'.repeat(31)); save(); expectCreated()
    })
    it('CP-VL-07 Color 5 dígitos (fuera) -> sin regla, se acepta', () => {
      openDialog(); nameInput().type('VLColor5'); colorInput().clear().type('#1A2B3'); save(); expectCreated()
    })
    it('CP-VL-08 Color 6 dígitos (válido) -> se acepta', () => {
      openDialog(); nameInput().type('VLColor6'); colorInput().clear().type('#1A2B3C'); save(); expectCreated()
    })
    it('CP-VL-09 Color 7 dígitos (fuera) -> sin regla, se acepta', () => {
      openDialog(); nameInput().type('VLColor7'); colorInput().clear().type('#1A2B3C4'); save(); expectCreated()
    })
  })

  describe('4. Transición de Estados', () => {
    it('CP-TE-01 No Existente -> Creada (nombre único + completos)', () => {
      openDialog(); nameInput().type('EstadoCreada01'); save(); expectCreated()
    })

    it('CP-TE-02 No Existente -> No Existente (duplicado): no hay control de unicidad, se crea igual (defecto)', () => {
      cy.request('POST', `${apiUrl}/categories`, { name: 'DuplicadaTE02', type: 'expense', color: '#222222' })
      cy.visit('/categories')
      openDialog(); nameInput().type('DuplicadaTE02'); save(); expectCreated()
    })

    it('CP-TE-03 No Existente -> No Existente (incompleto: color vacío)', () => {
      openDialog(); nameInput().type('EstadoIncompleto01'); colorInput().clear(); save()
      expectFieldError('El color es obligatorio')
    })

    it('CP-TE-04 Creada -> Eliminada (sin movimientos asociados)', () => {
      openDialog(); nameInput().type('EstadoEliminar01'); save(); expectCreated()
      deleteByName('EstadoEliminar01')
      cy.contains('Categoría eliminada correctamente')
      cy.contains('EstadoEliminar01').should('not.exist')
    })

    it('CP-TE-05 Creada(ConMovimientos) -> intento de eliminar: se elimina igual, no hay bloqueo (defecto)', () => {
      cy.request('POST', `${apiUrl}/categories`, { name: 'EstadoConMov01', type: 'expense', color: '#333333' }).then((res) => {
        cy.request('POST', `${apiUrl}/movements`, {
          type: 'expense', amount: 10000, description: 'Movimiento QA TE-05',
          date: '2026-01-01T00:00:00.000Z', categoryId: res.body.id,
        })
      })
      cy.visit('/categories')
      deleteByName('EstadoConMov01')
      cy.contains('Categoría eliminada correctamente')
      cy.contains('EstadoConMov01').should('not.exist')
    })
  })

  describe('5. Tablas de Decisión', () => {
    it('CP-TD-01 (A1) nombre único + campos completos -> creada', () => {
      openDialog(); nameInput().type('DecisionA1'); save(); expectCreated()
    })

    it('CP-TD-02 (A2) tipo vacío: No aplica, el Select siempre trae un valor por defecto (Gasto) y no permite un valor en blanco', () => {
      openDialog()
      cy.get('[role="combobox"]').should('contain.text', 'Gasto')
    })

    it('CP-TD-03 (A3) nombre existente + campos completos: no hay control de unicidad, se crea igual (defecto)', () => {
      cy.request('POST', `${apiUrl}/categories`, { name: 'DuplicadaTD03', type: 'expense', color: '#444444' })
      cy.visit('/categories')
      openDialog(); nameInput().type('DuplicadaTD03'); save(); expectCreated()
    })

    it('CP-TD-04 (A4) nombre existente + color vacío: prevalece la validación de campo obligatorio sobre la duplicidad', () => {
      cy.request('POST', `${apiUrl}/categories`, { name: 'DuplicadaTD04', type: 'expense', color: '#555555' })
      cy.visit('/categories')
      openDialog(); nameInput().type('DuplicadaTD04'); colorInput().clear(); save()
      expectFieldError('El color es obligatorio')
    })

    it('CP-TD-05 (C1) existe + movimientos asociados: se elimina igual, no hay bloqueo (defecto)', () => {
      cy.request('POST', `${apiUrl}/categories`, { name: 'DecisionConMov01', type: 'expense', color: '#666666' }).then((res) => {
        cy.request('POST', `${apiUrl}/movements`, {
          type: 'expense', amount: 5000, description: 'Movimiento QA TD-05',
          date: '2026-01-01T00:00:00.000Z', categoryId: res.body.id,
        })
      })
      cy.visit('/categories')
      deleteByName('DecisionConMov01')
      cy.contains('Categoría eliminada correctamente')
    })

    it('CP-TD-06 (C2) existe + sin movimientos asociados -> eliminación exitosa', () => {
      openDialog(); nameInput().type('DecisionSinMov01'); save(); expectCreated()
      deleteByName('DecisionSinMov01')
      cy.contains('Categoría eliminada correctamente')
    })
  })
})
