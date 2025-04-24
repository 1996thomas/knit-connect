import { BlockStack, Card, Collapsible, Divider, Page, Text } from "@shopify/polaris";
import { useState } from "react";

export default function page() {
  // Initialisez un tableau d'états pour chaque question
  const [openQuestions, setOpenQuestions] = useState([
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]); // La première question est ouverte par défaut

  // Fonction pour basculer l'état de la question sur le bon index
  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) =>
      prev.map((isOpen, idx) => (idx === index ? !isOpen : isOpen)),
    );
  };

  return (
    <Page fullWidth>
      <Card>
        <BlockStack gap={"400"}>
          <Text variant="headingLg" as="h1">
            FAQ - Knit application
          </Text>
          <Text variant="bodyLg" as="p">
            Here are the most frequently asked questions about the Knit, click
            on the question to see the answer.
          </Text>
          <BlockStack gap={"600"}>
            {/* Question 1 */}
            <BlockStack gap={"300"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(0)}
                  style={{ cursor: "pointer" }}
                >
                  1 - What is the Knit application?
                </div>
              </Text>
              <Collapsible open={openQuestions[0]} id="collapsible-1">
                <Text variant="bodyLg" as="p">
                  The Knit application is a turnkey management tool designed for
                  partner brands of the 99knit.com platform. It allows you to
                  sync your products for integration into the catalog of our
                  concept store. The application will generate orders directly
                  from your Shopify back-end.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 2 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(1)}
                  style={{ cursor: "pointer" }}
                >
                  2 - What is the Knit application?
                </div>
              </Text>
              <Collapsible open={openQuestions[1]} id="collapsible-2">
                <Text variant="bodyLg" as="p">
                  The Knit application is a turnkey management tool designed for
                  partner brands of the 99knit.com platform. It allows you to
                  sync your products for integration into the catalog of our
                  concept store. The application will generate orders directly
                  from your Shopify back-end.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 3 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(2)}
                  style={{ cursor: "pointer" }}
                >
                  3 - Is the application free?
                </div>
              </Text>
              <Collapsible open={openQuestions[2]} id="collapsible-3">
                <Text variant="bodyLg" as="p">
                  Yes, the application is free for partners. Knit applies a
                  commission percentage on sales, as specified in the agreement
                  signed with each partner.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 4 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(3)}
                  style={{ cursor: "pointer" }}
                >
                  4 - What should I do if I receive an order with no available
                  stock?
                </div>
              </Text>
              <Collapsible open={openQuestions[3]} id="collapsible-4">
                <Text variant="bodyLg" as="p">
                  If you correctly indicate the stock quantity when integrating
                  the product on your Shopify, and if that stock is reserved
                  exclusively for Shopify, there will be no interference with
                  the stock indicated. Once a product is out of stock, it will
                  automatically appear as "sold out" on the Knit catalog.
                  Therefore, unless a technical bug occurs (for which you are
                  not responsible), this should not happen.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 5 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(4)}
                  style={{ cursor: "pointer" }}
                >
                  5 - What happens if an order is placed simultaneously on Knit
                  and my Shopify while there is only one unit left in stock?
                </div>
              </Text>
              <Collapsible open={openQuestions[4]} id="collapsible-5">
                <Text variant="bodyLg" as="p">
                  Before confirming the client’s order, our server sends a final
                  request to verify the stock status and ensure the item is
                  still available for sale. Therefore, unless a technical bug
                  occurs (for which you are not responsible), this should not
                  happen.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 6 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(5)}
                  style={{ cursor: "pointer" }}
                >
                  6 - How are product returns handled?
                </div>
              </Text>
              <Collapsible open={openQuestions[5]} id="collapsible-6">
                <Text variant="bodyLg" as="p">
                  Knit handles customer service requests and returns or
                  exchanges, which are processed through the partner brands'
                  logistics. The brand does not pay for the return shipping
                  unless the return is due to its own error. Full return policy
                  details are specified in the commercial partnership agreement
                  between the brand and Knit.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 7 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(6)}
                  style={{ cursor: "pointer" }}
                >
                  7 - What data is collected through the application?
                </div>
              </Text>
              <Collapsible open={openQuestions[6]} id="collapsible-7">
                <Text variant="bodyLg" as="p">
                  We only collect the data necessary for the proper functioning
                  of the service: product information, orders, and customer data
                  (name, address, phone number, email) for shipping, customer
                  service, and customer loyalty management.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 8 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(7)}
                  style={{ cursor: "pointer" }}
                >
                  8 - Where is my data hosted, and is it secure?
                </div>
              </Text>
              <Collapsible open={openQuestions[7]} id="collapsible-8">
                <Text variant="bodyLg" as="p">
                  All data is hosted on secure infrastructures using Railway, Vercel,
                  NeonDB, and Upstash. Data may be transferred outside the EU
                  under standard contractual clauses ensuring their protection.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 9 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(8)}
                  style={{ cursor: "pointer" }}
                >
                  9 - Do partner brands have access to the personal data of end
                  customers?
                </div>
              </Text>
              <Collapsible open={openQuestions[8]} id="collapsible-9">
                <Text variant="bodyLg" as="p">
                  No. Only Knit has access to personal data in the context of
                  order management and customer service. Partners only have
                  access to the data necessary to process their shipments, under
                  strict contractual control.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 10 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(9)}
                  style={{ cursor: "pointer" }}
                >
                  10 - How do I receive my sales commissions?
                </div>
              </Text>
              <Collapsible open={openQuestions[9]} id="collapsible-10">
                <Text variant="bodyLg" as="p">
                  Sales commissions are sent via bank transfer every 15 days, as
                  long as the orders have been shipped and received by the
                  customers.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 11 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(10)}
                  style={{ cursor: "pointer" }}
                >
                  11 - How can I uninstall the application?
                </div>
              </Text>
              <Collapsible open={openQuestions[10]} id="collapsible-11">
                <Text variant="bodyLg" as="p">
                  You can uninstall the application directly from your Shopify
                  dashboard, in compliance with the notice period indicated in
                  your commercial partnership agreement. Uninstalling the app
                  will stop synchronization and data collection.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 12 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(11)}
                  style={{ cursor: "pointer" }}
                >
                  12 - What should I do in case of a technical issue or
                  question?
                </div>
              </Text>
              <Collapsible open={openQuestions[11]} id="collapsible-12">
                <Text variant="bodyLg" as="p">
                  Technical issues related to the Knit app will never impact the
                  proper functioning of your own Shopify store. We will
                  intervene as quickly as possible in the event of a technical
                  issue that prevents the normal operation of the application.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 13 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(12)}
                  style={{ cursor: "pointer" }}
                >
                  13 - Does Knit use cookies through this application?
                </div>
              </Text>
              <Collapsible open={openQuestions[12]} id="collapsible-13">
                <Text variant="bodyLg" as="p">
                  No. The Knit application does not install any cookies on your
                  device. It operates through secure APIs between your Shopify
                  back-end and our infrastructure.
                </Text>
              </Collapsible>
            </BlockStack>
            <Divider />

            {/* Question 14 */}
            <BlockStack gap={"200"}>
              <Text variant="headingLg" as="h2">
                <div
                  onClick={() => toggleQuestion(13)}
                  style={{ cursor: "pointer" }}
                >
                  14 - How do I receive my sales commissions?
                </div>
              </Text>
              <Collapsible open={openQuestions[13]} id="collapsible-14">
                <Text variant="bodyLg" as="p">
                  Sales commissions are sent via bank transfer every 15 days, as
                  long as the orders have been properly shipped.
                </Text>
              </Collapsible>
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </Card>
    </Page>
  );
}
