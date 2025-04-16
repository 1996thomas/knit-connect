import { Card, Layout, Text, Page, BlockStack } from "@shopify/polaris";
import React from "react";

export default function page() {
  return (
    <Page
      title="Knit-connect"
      primaryAction={{
        content: "Contact us",
        url: "mailto:tristan.reynaud@99knit.com",
      }}
      secondaryActions={[
        { content: "Back to Home", url: "/app/partner" },

        {
          content: "Privacy Policy",
          url: "/app/privacy-policy",
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="200">
            <Text as="h2" variant="heading3xl">
              Legal Notices
            </Text>
            <Text as="p" variant="bodyMd">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A eum,
              fuga, tempora odio error doloremque dicta perferendis similique
              dolor, possimus impedit vitae reiciendis quam alias autem
              accusantium. Exercitationem, mollitia animi! Ea quae facilis
              commodi iste, laboriosam accusantium quod atque excepturi sunt aut
              eius quidem ipsa quam delectus molestias quis tenetur. Vero odit
              atque tempora eius similique eum sed soluta pariatur! Aperiam
              facere laborum fugiat eum eveniet! Perferendis hic magni earum,
              soluta doloribus delectus, ratione, reprehenderit ad quaerat iste
              consectetur modi necessitatibus. Sequi accusamus consectetur amet,
              ipsa nam itaque dolorum ex!
            </Text>
            <Text as="p" variant="bodyMd">
              Magni excepturi numquam id fuga animi, obcaecati sint. Tempore
              temporibus, ducimus facilis vitae cum deleniti nostrum? Harum
              nobis cupiditate soluta aut obcaecati sunt, dolorum natus tenetur
              eligendi ratione amet nostrum? Eveniet similique omnis quam labore
              deserunt, minima ducimus id magni non delectus! Obcaecati maxime
              odio, optio necessitatibus earum culpa quas? Molestias nostrum
              repellat consectetur ex ipsam quo veritatis error id. Impedit,
              libero animi? Nulla beatae accusantium ad non maxime velit placeat
              facere cumque libero, doloremque exercitationem porro fugit minus
              autem cum sapiente, iure consequuntur quod voluptate quisquam
              natus. Fuga, dignissimos? Nobis nisi similique, reprehenderit
              reiciendis possimus odio laudantium accusantium temporibus.
            </Text>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
