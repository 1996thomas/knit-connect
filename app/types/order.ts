export interface Order {
  original_order: string | null;
  createdAt: Date | string;
  order: {
    totalPriceSet: any;
    order_id: string;
    id: string;
    name: string;
    createdAt: Date;

    lineItems: {
      nodes: {
        id: string;
        name: string;
        quantity: number;
        totalPriceSet: {
          presentmentMoney: {
            amount: string;
          };
        };
        image: {
          url: string;
          altText: string;
        };
        variant?: {
          title: string;
        };
      }[];
    };
  };
  delivery_label?: {
    reservationNumber: string;
    pdfUrl: string;
    skybillNumber: string;
  };
}
