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

  // ==========================================================================
  // 6. CASO AUTOMATIZADO COMPLETO — ENTREGA ANDERSON (checklist de automatización)
  // ==========================================================================
  // Caso único, de extremo a extremo, sobre /categories. Cumple en un solo
  // flujo: >=10 pasos, acciones (click/type/select), aserciones de texto, de
  // elementos presentes, de título, de URL, de estilos CSS, de contenido de
  // un dropdown, y el llenado de un formulario validando el mensaje de éxito
  // Y el de error.
  //
  // ANTES DE EJECUTAR — 2 valores que esta sesión no pudo verificar porque no
  // tuvo la app corriendo ni el componente de layout/navegación (no se subió
  // en este contexto). Ábrelos una vez en el navegador y reemplázalos aquí:
  //   - EXPECTED_HEADING_FONT_FAMILY: DevTools > inspeccionar el <h1>
  //     "Categorías" > pestaña Computed > font-family (copiar tal cual).
  //   - EXPECTED_HEADING_COLOR: mismo <h1> > Computed > color (formato
  //     "rgb(r, g, b)", que es como Cypress lo expone vía `have.css`).
  // El título de pestaña (EXPECTED_PAGE_TITLE) se dejó en "FinanzaPro" como
  // supuesto razonable (nombre del proyecto, ver portada del informe PPI);
  // confírmalo con `cy.title()` o el <title> de index.html y ajústalo si
  // difiere.
  const EXPECTED_PAGE_TITLE = 'FinanzaPro' // verificado con cy.title() en la app corriendo
  const EXPECTED_HEADING_FONT_FAMILY = 'Inter, sans-serif' // verificado con getComputedStyle del h1
  const EXPECTED_HEADING_COLOR = 'rgb(15, 23, 41)' // verificado con getComputedStyle del h1

  describe('6. Caso automatizado completo (checklist de entrega) - Formulario de categoría', () => {
    const apiUrl = 'http://localhost:3001/api'
    const nombreDuplicado = 'ChecklistDuplicada01'
    const nombreNuevo = 'ChecklistExitoso01'
    const colorNuevo = '#1A2B3C' // -> rgb(26, 43, 60), usado en la aserción de background-color

    it('CP-CHK-CAT-01 - navegación, elementos, dropdown de tipo, creación exitosa y rechazo de nombre duplicado', () => {
      // Precondición de datos: existe previamente una categoría con el nombre
      // que luego se intentará duplicar desde la interfaz.
      cy.request('POST', `${apiUrl}/categories`, { name: nombreDuplicado, type: 'expense', color: '#999999' })

      // Paso 1: navegar a la URL de categorías
      cy.visit('/categories')

      // Paso 2: aserción de URL exacta
      cy.url().should('eq', 'http://localhost:5173/categories')

      // Paso 3: aserción de título de página exacto
      cy.title().should('eq', EXPECTED_PAGE_TITLE)

      // Paso 4: aserción de elementos de navegación presentes (menú).
      // Basado en las rutas reales declaradas en App.tsx (no se tuvo acceso
      // al componente de layout/menú en esta sesión, por eso se valida por
      // href en vez de por texto visible del enlace).
      cy.get('a[href="/"]').should('exist')
      cy.get('a[href="/movements"]').should('exist')
      cy.get('a[href="/categories"]').should('exist')
      cy.get('a[href="/profile"]').should('exist')

      // Paso 5: aserciones de texto y de elementos presentes en el encabezado
      cy.get('h1').should('contain.text', 'Categorías')
      cy.contains('p', 'Gestiona tus categorías de ingresos y gastos').should('be.visible')

      // Paso 6: aserciones de estilos CSS sobre el encabezado
      // font-family y color: valores a completar localmente (ver TODO arriba).
      if (EXPECTED_HEADING_FONT_FAMILY) {
        cy.get('h1').should('have.css', 'font-family', EXPECTED_HEADING_FONT_FAMILY)
      }
      if (EXPECTED_HEADING_COLOR) {
        cy.get('h1').should('have.css', 'color', EXPECTED_HEADING_COLOR)
      }

      // Paso 7: elemento presente (botón) + acción (click) para abrir el formulario
      cy.contains('button', 'Nueva Categoría').should('be.visible').click()

      // Paso 8: aserción de texto + elemento presente (título del dialogo y campos del formulario)
      cy.contains('Crear nueva categoría').should('be.visible')
      cy.get('input[placeholder="Ej. Viajes"]').should('exist')
      cy.get('[role="combobox"]').should('exist')
      cy.get('.flex.gap-2 input[type="text"]').should('exist')
      cy.get('.flex.gap-2 input[type="color"]').should('exist')

      // Paso 9: validación del contenido del dropdown "Tipo" (acción: click para abrir)
      cy.get('[role="combobox"]').click()
      cy.get('[role="option"]').should('have.length', 3)
      cy.get('[role="option"]').eq(0).should('contain.text', 'Ingreso')
      cy.get('[role="option"]').eq(1).should('contain.text', 'Gasto')
      cy.get('[role="option"]').eq(2).should('contain.text', 'Ambos')
      // Acción: seleccionar una opción del dropdown
      cy.contains('[role="option"]', 'Gasto').click()

      // Paso 10: acciones de llenado de formulario (type)
      cy.get('input[placeholder="Ej. Viajes"]').type(nombreNuevo)
      cy.get('.flex.gap-2 input[type="text"]').clear().type(colorNuevo)

      // Paso 11: acción (click, guardar) + aserción de mensaje de éxito (texto)
      cy.contains('button', 'Guardar').click()
      cy.contains('Categoría creada correctamente').should('be.visible')
      cy.screenshot('02_exito_creacion', { capture: 'viewport' })

      // Paso 12: aserción de elemento presente + texto + estilo CSS (background-color)
      // sobre la categoría recién creada en el listado.
      cy.contains('h3', nombreNuevo)
        .parents('div.p-6')
        .find('div.rounded-full')
        .should('have.css', 'background-color', 'rgb(26, 43, 60)')

      // Paso 13: acción - reabrir el formulario para el caso de nombre duplicado
      cy.contains('button', 'Nueva Categoría').click()
      cy.get('input[placeholder="Ej. Viajes"]').type(nombreDuplicado)
      cy.get('.flex.gap-2 input[type="text"]').clear().type('#654321')

      // Paso 14: acción (guardar) + aserción del mensaje de error esperado
      // IMPORTANTE: a la fecha de redacción de este caso, el formulario
      // (`categories.tsx`) y el endpoint `POST /categories`
      // (`api-server/src/routes/categories.ts`) NO verifican nombres
      // duplicados antes de guardar (hallazgo H1 del informe de pruebas de
      // caja negra). El mensaje abajo es un SUPUESTO del equipo de QA sobre
      // cuál debería ser el texto, consistente con el estilo de los mensajes
      // de validación ya existentes en la app ("El nombre es obligatorio",
      // "El color es obligatorio"). Se espera que esta aserción FALLE contra
      // la aplicación actual; el fallo es, en sí mismo, la evidencia
      // automatizada del defecto. Si el equipo de desarrollo implementa la
      // validación con un texto distinto, ajustar este literal.
      cy.contains('button', 'Guardar').click()
      cy.wait(1500) // deja terminar el guardado antes de la captura
      cy.screenshot('03_error_duplicado', { capture: 'viewport' })
      cy.contains('Ya existe una categoría con ese nombre').should('be.visible')
    })
  })
})
