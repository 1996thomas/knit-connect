export interface Product {
  status: string;
  media: any;
  node: {
    status: string;
    media: Media;
    id: string;
    title: string;
    totalInventory: number;
    featuredMedia: Image | null;
    vendor: string;
    descriptionHtml: string;
    handle: string;
    productType: string;
    createdAt: string;
    updatedAt: string;
    images: ImageEdgeConnection;
    variants: VariantEdgeConnection;
    options: ProductOptionsData;
    tags: string[];
    metafields: MetafieldEdgeConnection;
  };
}

export interface Media {
  edges: [
    {
      mediaContentType: string;
      node: {
        alt: string;
        image: Image;
      };
    },
  ];
}

export interface Variant {
  node: {
    id: string;
    title: string;
    inventoryQuantity: number;
    price: string;
    sku: string;
    availableForSale: boolean;
    selectedOptions: [{ name: string; value: string }];
    inventoryItem: {};
  };
}

export interface VariantEdge {
  node: Variant["node"];
}

export interface VariantEdgeConnection {
  edges: VariantEdge[];
}

export interface Image {
  url: string;
  alt: string;
}

export interface ImageEdge {
  node: Image;
}

export interface ImageEdgeConnection {
  edges: ImageEdge[];
}
export type ProductOptionValue = {
  name: string;
};

export type ProductOption = {
  name: string;
  position: number;
  values: ProductOptionValue[];
};

type ProductOptionsData = ProductOption[];
export interface Metafield {
  node: {
    id: string;
    namespace: string;
    key: string;
    value: string;
    type: string;
  };
}

export interface MetafieldEdge {
  node: Metafield["node"];
}

export interface MetafieldEdgeConnection {
  edges: MetafieldEdge[];
}

export interface CarrierService {
  id: string;
  // Ajoutez d'autres propriétés retournées par l'API si besoin, par exemple :
  // name: string;
  // callbackUrl: string;
  // etc.
}

// Interface pour les erreurs utilisateur
export interface CarrierServiceCreateUserError {
  field?: string[];
  message: string;
  code?: string;
}

// Payload renvoyé par la mutation carrierServiceCreate
export interface CarrierServiceCreatePayload {
  carrierService: CarrierService | null;
  userErrors: CarrierServiceCreateUserError[];
}

// Interface de la réponse complète de la mutation
export interface CarrierServiceCreateResponse {
  carrierServiceCreate: CarrierServiceCreatePayload;
}

export interface OrderFromKnit {
  original_order: any;
  partner_order_id: string;
  delivery_label: {
    pdfUrl: string;
    skybillNumber: string;
    reservationNumber: string;
  };
}
