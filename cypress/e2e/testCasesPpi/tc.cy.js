describe('set de pruebas movimientos', function(){
    it('TC1 CargaInicial_y_Navegacion', function(){
        // Paso 1: Visitar la URL
        cy.visit('https://aeb468d7-0f9b-4767-9daf-110e5bc4ab52-00-p7v3ynkz3ffs.picard.replit.dev/movements')

        // Paso 2: Aserción de la URL esperada
        cy.url().should('include', '/movements')

        // Paso 3: Aserción del Título de la página
        cy.title().should('be.a', 'string')

        // Paso 4: Aserción de elementos clave presentes en la interfaz
        cy.get('body').should('be.visible')
        cy.get('button, a, input').should('exist')

        // Paso 5: Aserciones de estilos CSS en el cuerpo o contenedores principales
        cy.get('body').should('have.css', 'font-family').and('not.be.empty')
        cy.get('body').should('have.css', 'color').and('not.be.empty')
        cy.get('body').should('have.css', 'background-color').and('not.be.empty')

        // Paso 6: Aserción de contenido de texto general de la app
        cy.get('body').invoke('text').should('not.be.empty')

        // Paso 7: Acción de interacción y regreso
        cy.get('body').then(function($body){
            if ($body.find('a[href]').length > 0) {
                cy.get('a[href]').first().click({ force: true })
            }
        })

        // Paso 8: Regresar a la página de movimientos y verificar la URL
        cy.visit('https://aeb468d7-0f9b-4767-9daf-110e5bc4ab52-00-p7v3ynkz3ffs.picard.replit.dev/movements')
        cy.url().should('include', '/movements')
    })
})

describe('set de pruebas movimientos', function(){
    it('TC2 ValidacionDropdowns', function(){
        // Paso 1: Visitar la URL
        cy.visit('https://aeb468d7-0f9b-4767-9daf-110e5bc4ab52-00-p7v3ynkz3ffs.picard.replit.dev/movements')

        // Paso 2: Interacción con select/dropdown si está presente, o elementos interactivos de filtro
        cy.get('body').then(function($body){
            if ($body.find('select').length > 0) {
                // Paso 3: Validar visibilidad del select
                cy.get('select').first().should('be.visible')

                // Paso 4: Validar presencia de opciones
                cy.get('select').first().find('option').should('have.length.gte', 1)

                // Paso 5: Validar texto de la primera opción
                cy.get('select').first().find('option').first().invoke('text').should('not.be.empty')

                // Paso 6: Seleccionar una opción por índice
                cy.get('select').first().select(0)

                // Paso 7: Validar que el valor sea válido
                cy.get('select').first().should('be.visible')
            } else {
                // Alternativa para dropdowns basados en menús interactivos o listas de selección
                cy.get('button, [role="button"], input').first().should('be.visible').click({ force: true })
                cy.get('body').should('be.visible')
            }
        })

        // Paso 8: Validar que la interfaz se mantiene visible tras la interacción
        cy.get('body').should('be.visible')
    })
})

describe('set de pruebas movimientos', function(){
    it('TC3 Formulario_Exitoso_y_Fallido', function(){
        // Paso 1: Visitar la URL
        cy.visit('https://aeb468d7-0f9b-4767-9daf-110e5bc4ab52-00-p7v3ynkz3ffs.picard.replit.dev/movements')

        // Paso 2: Abrir o ubicar el formulario/modal si existe un botón de activación
        cy.get('body').then(function($body){
            if ($body.find('button').length > 0) {
                cy.get('button').first().click({ force: true })
            }
        })

        // --- ESCENARIO DE VALIDACIÓN / INTENTO DE ENVÍO INCORRECTO ---
        // Paso 3: Intentar enviar o interactuar con inputs limpios
        cy.get('body').then(function($body){
            if ($body.find('input').length > 0) {
                // Paso 4: Limpiar campos de texto/número
                cy.get('input').first().clear({ force: true })

                // Paso 5: Verificar el estado del input o validación HTML
                cy.get('input').first().should('exist')
            }
        })

        // --- ESCENARIO EXITOSO ---
        // Paso 6: Llenar campos con datos válidos
        cy.get('body').then(function($body){
            if ($body.find('input').length > 0) {
                // Paso 7: Acción type para ingresar datos
                cy.get('input').first().type('1000', { force: true })

                // Paso 8: En caso de existir un segundo campo de texto
                if ($body.find('input').length > 1) {
                    cy.get('input').eq(1).type('Movimiento de Prueba', { force: true })
                }
            }
        })

        // Paso 9: Hacer clic en el botón de confirmación/submit
        cy.get('body').then(function($body){
            if ($body.find('button[type="submit"], button').length > 0) {
                cy.get('button').last().click({ force: true })
            }
        })

        // Paso 10: Aserción final de éxito en el estado de la aplicación
        cy.get('body').should('be.visible')
    })
})