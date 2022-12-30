import { UniswapInterfaceMulticallMockContract } from "metamocks";

import {
  MULTICALL_ADDRESS,
  SWAP_ROUTER_ADDRESSES,
} from "../../src/constants/addresses";
import { SupportedChainId } from "../../src/constants/chains";
import { SwapRouter02, UniswapInterfaceMulticall } from "../../src/types/v3";
import { getTestSelector } from "../utils";
import SwapRouter02Handler from "../utils/abihandlers/SwapRouter02";

describe("Swap", () => {
  before(() => {
    cy.setupMetamocks();
    cy.visit("/swap");
  });

  it("starts with ETH selected by default", () => {
    cy.get("#swap-currency-input .token-amount-input").should("have.value", "");
    cy.get("#swap-currency-input .token-symbol-container").should(
      "contain.text",
      "ETH"
    );
    cy.get("#swap-currency-output .token-amount-input").should(
      "not.have.value"
    );
    cy.get("#swap-currency-output .token-symbol-container").should(
      "contain.text",
      "Select token"
    );
  });

  it("can enter an amount into input", () => {
    cy.get("#swap-currency-input .token-amount-input")
      .clear()
      .type("0.001")
      .should("have.value", "0.001");
  });

  it("zero swap amount", () => {
    cy.get("#swap-currency-input .token-amount-input")
      .clear()
      .type("0.0")
      .should("have.value", "0.0");
  });

  it("invalid swap amount", () => {
    cy.get("#swap-currency-input .token-amount-input")
      .clear()
      .type("\\")
      .should("have.value", "");
  });

  it("can enter an amount into output", () => {
    cy.get("#swap-currency-output .token-amount-input")
      .clear()
      .type("0.001")
      .should("have.value", "0.001");
  });

  it("zero output amount", () => {
    cy.get("#swap-currency-output .token-amount-input")
      .clear()
      .type("0.0")
      .should("have.value", "0.0");
  });

  const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const WETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

  it.only("can swap ETH for UNI", function () {
    cy.fixture("swapQuote.json").then((swapQuote) => {
      const swapRouterHandler =
        this.metamocks.registerMockContract<SwapRouter02>(
          SWAP_ROUTER_ADDRESSES[SupportedChainId.GOERLI],
          SwapRouter02Handler
        );
      this.metamocks.registerMockContract<UniswapInterfaceMulticall>(
        MULTICALL_ADDRESS[SupportedChainId.GOERLI],
        UniswapInterfaceMulticallMockContract
      );
      cy.spy(swapRouterHandler, "multicall(uint256,bytes[])");
      cy.spy(swapRouterHandler, "swapExactTokensForTokens");
      cy.spy(swapRouterHandler, "exactInputSingle");
      cy.spy(swapRouterHandler, "sweepToken(address,uint256,address)");
      cy.intercept(
        {
          method: "GET",
          url: "https://api.uniswap.org/v1/amplitude-proxy",
        },
        {
          body: {
            code: 200,
            server_upload_time: 1672227370448,
            payload_size_bytes: 1666,
            events_ingested: 2,
          },
        }
      );

      cy.intercept(
        {
          method: "GET",
          url: `https://api.uniswap.org/v1/quote?protocols=v2%2Cv3%2Cmixed&tokenInAddress=${WETH_ADDRESS}&tokenInChainId=5&tokenOutAddress=${UNI}&tokenOutChainId=5&amount=1000000000000000&type=exactIn`,
        },
        {
          body: swapQuote,
        }
      );
      cy.get(getTestSelector("navbar-connect-wallet")).click();
      cy.get("#injected").click();
      cy.get("#swap-currency-output .open-currency-select-button").click();
      cy.get(`.token-item-${UNI}`).click({ timeout: 30000 });
      cy.get(getTestSelector("token-safety-confirm")).click();
      cy.get("#swap-currency-input .token-amount-input")
        .clear()
        .type("0.001", { force: true, delay: 1000 });
      cy.get("#swap-currency-output .token-amount-input").should(
        "not.equal",
        ""
      );
      cy.get("#swap-button").click();
      cy.get("#confirm-swap-or-send")
        .should("contain", "Confirm Swap")
        .click()
        .then(() => {
          expect(swapRouterHandler["multicall(uint256,bytes[])"]).to.have
            .called;
          expect(swapRouterHandler["swapExactTokensForTokens"]).to.have.called;
          expect(swapRouterHandler["exactInputSingle"]).to.have.called;
          expect(swapRouterHandler["sweepToken(address,uint256,address)"]).to
            .have.called;
        });
      cy.get(getTestSelector("transaction-submitted")).should("exist");
    });
  });

  it("add a recipient does not exist unless in expert mode", () => {
    cy.get("#add-recipient-button").should("not.exist");
  });

  it.skip("ETH to wETH is same value (wrapped swaps have no price impact)", () => {
    cy.get("#swap-currency-output .open-currency-select-button").click();
    cy.get(".token-item-0xc778417E063141139Fce010982780140Aa0cD5Ab").click();
    cy.get("#swap-currency-input .token-amount-input").clear().type("0.01");
    cy.get("#swap-currency-output .token-amount-input").should(
      "have.value",
      "0.01"
    );
  });
});
