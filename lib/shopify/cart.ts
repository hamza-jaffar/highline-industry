import { shopifyFetch } from "./shopify";

/**
 * We use Draft Orders via the Admin API as a more reliable alternative 
 * to the Storefront API for cart management in this environment.
 */

export async function createCart(lines: { variantId: string, quantity: number, price?: string, attributes?: { key: string, value: string }[] }[] = [], options?: { customAttributes?: { key: string, value: string }[] }) {
  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
          currencyCode
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const variables = {
    input: {
      lineItems: lines.map(line => ({
        variantId: line.variantId,
        quantity: line.quantity,
        priceOverride: line.price ? {
          amount: line.price,
          currencyCode: "USD"
        } : undefined,
        customAttributes: line.attributes
      })),
      customAttributes: options?.customAttributes
    }
  };
  const response = await shopifyFetch(query, variables);
  const data = response.data.draftOrderCreate;
  
  if (data.userErrors && data.userErrors.length > 0) {
    throw new Error(data.userErrors[0].message);
  }
  
  return {
    id: data.draftOrder.id,
    checkoutUrl: data.draftOrder.invoiceUrl,
    currencyCode: data.draftOrder.currencyCode
  };
}

export async function getCart(cartId: string) {
  const query = `
    query getDraftOrder($id: ID!) {
      draftOrder(id: $id) {
        id
        invoiceUrl
        lineItems(first: 100) {
          edges {
            node {
              id
              quantity
              title
              variant {
                id
                title
                price
                product {
                  title
                  handle
                }
              }
              customAttributes {
                key
                value
              }
              originalUnitPrice
            }
          }
        }
        totalPrice
        subtotalPrice
        currencyCode
      }
    }
  `;
  const response = await shopifyFetch(query, { id: cartId });
  const draftOrder = response.data.draftOrder;

  if (!draftOrder) return null;

  return {
    id: draftOrder.id,
    checkoutUrl: draftOrder.invoiceUrl,
    currencyCode: draftOrder.currencyCode,
    lines: {
      edges: draftOrder.lineItems.edges.map((edge: any) => ({
        node: {
          id: edge.node.id,
          quantity: edge.node.quantity,
          merchandise: {
            id: edge.node.variant?.id,
            title: edge.node.variant?.title,
            product: edge.node.variant?.product,
            price: edge.node.variant?.price
          },
          attributes: edge.node.customAttributes,
          cost: {
            totalAmount: {
              amount: (parseFloat(edge.node.originalUnitPrice) * edge.node.quantity).toFixed(2),
              currencyCode: draftOrder.currencyCode
            }
          }
        }
      }))
    },
    cost: {
      totalAmount: {
        amount: draftOrder.totalPrice,
        currencyCode: draftOrder.currencyCode
      },
      subtotalAmount: {
        amount: draftOrder.subtotalPrice,
        currencyCode: draftOrder.currencyCode
      }
    }
  };
}

export async function addToCart(cartId: string, lines: { variantId: string, quantity: number, price?: string, attributes?: { key: string, value: string }[] }[], options?: { customAttributes?: { key: string, value: string }[] }) {
  const currentCart = await getCart(cartId);
  if (!currentCart) throw new Error("Cart not found");

  const currencyCode = currentCart.currencyCode || "USD";

  const currentLines = currentCart.lines.edges.map((edge: any) => ({
    variantId: edge.node.merchandise.id,
    quantity: edge.node.quantity,
    priceOverride: {
      amount: (parseFloat(edge.node.cost.totalAmount.amount) / edge.node.quantity).toFixed(2),
      currencyCode: currencyCode
    },
    customAttributes: edge.node.attributes
  }));

  const newLines = lines.map(line => ({
    variantId: line.variantId,
    quantity: line.quantity,
    priceOverride: line.price ? {
      amount: line.price,
      currencyCode: currencyCode
    } : undefined,
    customAttributes: line.attributes
  }));

  const combinedLines = [...currentLines, ...newLines];

  const query = `
    mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch(query, {
    id: cartId,
    input: { 
      lineItems: combinedLines,
      customAttributes: options?.customAttributes
    }
  });

  const updatedCart = await getCart(cartId);
  return {
    cart: updatedCart,
    userErrors: response.data.draftOrderUpdate.userErrors
  };
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const currentCart = await getCart(cartId);
  if (!currentCart) throw new Error("Cart not found");

  const currencyCode = currentCart.currencyCode || "USD";

  const linesToKeep = currentCart.lines.edges
    .filter((edge: any) => !lineIds.includes(edge.node.id))
    .map((edge: any) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
      priceOverride: {
        amount: (parseFloat(edge.node.cost.totalAmount.amount) / edge.node.quantity).toFixed(2),
        currencyCode: currencyCode
      },
      customAttributes: edge.node.attributes
    }));

  const query = `
    mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder { id }
        userErrors { field message }
      }
    }
  `;

  const response = await shopifyFetch(query, {
    id: cartId,
    input: { lineItems: linesToKeep }
  });

  const updatedCart = await getCart(cartId);
  return {
    cart: updatedCart,
    userErrors: response.data.draftOrderUpdate.userErrors
  };
}

export async function updateCartLines(cartId: string, lines: { id: string, quantity: number }[]) {
  const currentCart = await getCart(cartId);
  if (!currentCart) throw new Error("Cart not found");

  const currencyCode = currentCart.currencyCode || "USD";

  const updatedLines = currentCart.lines.edges.map((edge: any) => {
    const update = lines.find(l => l.id === edge.node.id);
    return {
      variantId: edge.node.merchandise.id,
      quantity: update ? update.quantity : edge.node.quantity,
      priceOverride: {
        amount: (parseFloat(edge.node.cost.totalAmount.amount) / edge.node.quantity).toFixed(2),
        currencyCode: currencyCode
      },
      customAttributes: edge.node.attributes
    };
  });

  const query = `
    mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder { id }
        userErrors { field message }
      }
    }
  `;

  const response = await shopifyFetch(query, {
    id: cartId,
    input: { lineItems: updatedLines }
  });

  const updatedCart = await getCart(cartId);
  return {
    cart: updatedCart,
    userErrors: response.data.draftOrderUpdate.userErrors
  };
}
