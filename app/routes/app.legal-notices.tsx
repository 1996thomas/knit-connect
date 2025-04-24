import { Card, Layout, Text, Page, BlockStack, List } from "@shopify/polaris";
import React from "react";

export default function page() {
  return (
    <Page fullWidth title="Terms of Use">
      <Card>
        <BlockStack gap="200">
          {/* Header */}
          <Text as="p" variant="bodyMd">
            Last updated: March 2025
          </Text>

          {/* 1. Publisher Identification */}
          <Text as="h2" variant="headingMd">
            1. Publisher Identification
          </Text>
          <Text as="p" variant="bodyMd">
            The Knit application is published by Knit Paris SAS, registered with
            the Paris Trade and Companies Register under number 987 788 189,
            with its head office located at 6 rue Saint Jean‑Baptiste de la
            Salle, Paris, France.
          </Text>

          {/* 2. Purpose of the Application */}
          <Text as="h2" variant="headingMd">
            2. Purpose of the Application
          </Text>
          <Text as="p" variant="bodyMd">
            The Knit application enables automated management of the flows
            between the merchant’s Shopify store and the Knit platform: product
            synchronization, order management, generation of shipping labels,
            and logistical support.
          </Text>

          {/* 3. Access Conditions */}
          <Text as="h2" variant="headingMd">
            3. Access Conditions
          </Text>
          <Text as="p" variant="bodyMd">
            Access to the application is strictly reserved for Knit’s partner
            merchants holding a valid commercial agreement. The application is
            distributed as an unlisted public app and is only accessible via a
            private link provided by Knit.
          </Text>

          {/* 4. Pricing */}
          <Text as="h2" variant="headingMd">
            4. Pricing
          </Text>
          <Text as="p" variant="bodyMd">
            Use of the application is free of charge. A sales commission
            percentage is applied to transactions completed via the Knit
            platform, in accordance with the agreement signed between the
            partner brand and Knit.
          </Text>

          {/* 5. User Obligations */}
          <Text as="h2" variant="headingMd">
            5. User Obligations
          </Text>
          <List type="bullet">
            <List.Item>
              Provide accurate and up‑to‑date product information (stock levels,
              weight and size, product images).
            </List.Item>
            <List.Item>Use the application as intended.</List.Item>
            <List.Item>
              Only market products compliant with European standards.
            </List.Item>
            <List.Item>
              Not offer any illegal or counterfeit products.
            </List.Item>
            <List.Item>
              Comply with all applicable laws and regulations, including the
              French Consumer Code.
            </List.Item>
          </List>

          {/* 6. Intellectual Property */}
          <Text as="h2" variant="headingMd">
            6. Intellectual Property
          </Text>
          <Text as="p" variant="bodyMd">
            All elements of the Knit application (interface, visuals, text,
            code) are the exclusive property of Knit Paris SAS. Any
            reproduction, modification, or distribution, even partial, without
            prior written authorization is strictly prohibited.
          </Text>

          {/* 7. Limitation of Liability */}
          <Text as="h2" variant="headingMd">
            7. Limitation of Liability
          </Text>
          <List type="bullet">
            <List.Item>Temporary outages or service interruptions.</List.Item>
            <List.Item>Internal or external technical errors.</List.Item>
            <List.Item>
              Failures of third‑party services (Shopify API, Vercel, partner
              infrastructure).
            </List.Item>
            <List.Item>Errors or negligence by the user.</List.Item>
            <List.Item>
              Cyberattacks, malicious acts, or viruses beyond its control.
            </List.Item>
            <List.Item>Any event of force majeure.</List.Item>
          </List>

          {/* 8. Force Majeure */}
          <Text as="h2" variant="headingMd">
            8. Force Majeure
          </Text>
          <Text as="p" variant="bodyMd">
            Knit Paris SAS shall not be held liable in the event of a force
            majeure, including but not limited to natural disasters, strikes,
            wars, network outages, power failures, large‑scale cyberattacks, or
            any unpredictable situation beyond its control.
          </Text>

          {/* 9. Third‑Party Services and Dependencies */}
          <Text as="h2" variant="headingMd">
            9. Third‑Party Services and Dependencies
          </Text>
          <Text as="p" variant="bodyMd">
            Some features rely on third‑party services (Shopify API, Vercel,
            Chronopost). Knit Paris SAS is not liable for unavailability, bugs,
            or limitations of these services.
          </Text>

          {/* 10. Technical Developments */}
          <Text as="h2" variant="headingMd">
            10. Technical Developments
          </Text>
          <Text as="p" variant="bodyMd">
            Knit Paris SAS may upgrade the application at any time without
            disrupting service or altering contractual commitments.
          </Text>

          {/* 11. Legal Independence */}
          <Text as="h2" variant="headingMd">
            11. Legal Independence
          </Text>
          <Text as="p" variant="bodyMd">
            The use of the application does not create a legal partnership or
            joint venture beyond the commercial agreement.
          </Text>

          {/* 12. Termination and Uninstallation */}
          <Text as="h2" variant="headingMd">
            12. Termination and Uninstallation
          </Text>
          <Text as="p" variant="bodyMd">
            Users may uninstall the app at any time, ending all data
            synchronization and processes related to their account.
          </Text>

          {/* 13. Governing Law and Jurisdiction */}
          <Text as="h2" variant="headingMd">
            13. Governing Law and Jurisdiction
          </Text>
          <Text as="p" variant="bodyMd">
            These terms are governed by French law. Disputes are under the
            jurisdiction of Paris courts.
          </Text>

          {/* 14. Privacy Policy */}
          <Text as="h2" variant="headingMd">
            14. Privacy Policy
          </Text>
          <Text as="p" variant="bodyMd">
            Consult our privacy policy at the provided address or contact
            contact@99knit.com for questions.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
