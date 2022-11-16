import { getTestSelector } from "../utils";

describe('Swap', () => {
  before(() => {
    cy.visit('/swap')
  })

  it('starts with ETH selected by default', () => {
    cy.get('#swap-currency-input .token-amount-input').should('have.value', '')
    cy.get('#swap-currency-input .token-symbol-container').should('contain.text', 'ETH')
    cy.get('#swap-currency-output .token-amount-input').should('not.have.value')
    cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'Select token')
  })

  it('can enter an amount into input', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.001').should('have.value', '0.001')
  })

  it('zero swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.0').should('have.value', '0.0')
  })

  it('invalid swap amount', () => {
    cy.get('#swap-currency-input .token-amount-input').clear().type('\\').should('have.value', '')
  })

  it('can enter an amount into output', () => {
    cy.get('#swap-currency-output .token-amount-input').clear().type('0.001').should('have.value', '0.001')
  })

  it('zero output amount', () => {
    cy.get('#swap-currency-output .token-amount-input').clear().type('0.0').should('have.value', '0.0')
  })

  const UNI = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
  it.only('can swap ETH for UNI', () => {
    cy.get(getTestSelector('navbar-connect-wallet')).click()
    cy.get('#injected').click()
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get(`.token-item-${UNI}`).click({timeout: 30000})
    cy.get(getTestSelector('token-safety-confirm')).click()
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.001',  { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    cy.get('#swap-button').click()
    cy.get('#confirm-swap-or-send').should('contain', 'Confirm Swap')
    cy.get('[data-cy="confirmation-close-icon"]').click()
  })

  it('add a recipient does not exist unless in expert mode', () => {
    cy.get('#add-recipient-button').should('not.exist')
  })

  it.skip('ETH to wETH is same value (wrapped swaps have no price impact)', () => {
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get('.token-item-0xc778417E063141139Fce010982780140Aa0cD5Ab').click()
    cy.get('#swap-currency-input .token-amount-input').clear().type('0.01')
    cy.get('#swap-currency-output .token-amount-input').should('have.value', '0.01')
  })
})
