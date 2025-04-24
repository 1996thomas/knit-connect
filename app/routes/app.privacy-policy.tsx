import { BlockStack, Card, List, Page, Text } from "@shopify/polaris";
import React from "react";

export default function page() {
  return (
    <Page title="Privacy Policy" fullWidth>
      <Card>
        <BlockStack gap="200">
          {/* Header */}
          <BlockStack gap="200">
            <Text as="p" variant="bodyLg">
              Last updated: March 2025
            </Text>
            <Text as="p" variant="bodyMd">
              This privacy policy describes how the Knit app ("the App")
              collects, uses, and protects data when you install or use our
              service on your Shopify store.
            </Text>
          </BlockStack>

          {/* 1. Data Collected */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              1. Data Collected
            </Text>
            <List type="bullet">
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Information related to your Shopify store (store name, URL,
                  admin email, product catalog).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Product data (product listings, inventory, logistics
                  information).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Order data related to Knit only (order numbers, amounts,
                  statuses).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Personal data of end customers transmitted by Shopify during
                  orders: first name, last name, postal address, email, phone
                  number.
                </Text>
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              This data is collected solely to allow Knit to properly manage
              orders, deliveries, customer service, and loyalty activities. The
              App does not place any cookies on users’ devices for greater
              transparency.
            </Text>
          </BlockStack>

          {/* 2. Use of Data */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              2. Use of Data
            </Text>
            <List type="bullet">
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Synchronizing products and inventory between your Shopify
                  store and the Knit platform.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Managing and tracking orders.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Generating and providing shipping labels.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Handling customer service and claims.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Carrying out loyalty and customer follow-up actions within a
                  strictly commercial and data-respectful framework.
                </Text>
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              As payments are managed through Shopify Payments, no banking data
              is collected or processed by Knit.
            </Text>
          </BlockStack>

          {/* 3. Data Access */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              3. Data Access
            </Text>
            <Text as="p" variant="bodyMd">
              The collected data is accessible only by the Knit team and is
              never shared with partner brands, except for information strictly
              necessary for shipping orders (recipient’s name, address, and
              phone number). This sharing is done under a strict contractual
              framework and solely for the purpose of delivery.
            </Text>
          </BlockStack>

          {/* 4. Hosting and Security */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              4. Hosting and Security
            </Text>
            <List type="bullet">
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Railway ( hosting and secure processing in an
                  international cloud environment).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  NeonDB (PostgreSQL database).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Redis and Qstash (dynamic task management and logging).
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Vercel Blob (temporary storage of shipping labels).
                </Text>
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              All data is protected by encryption protocols and accessible only
              to internal services necessary for its processing.
            </Text>
          </BlockStack>

          {/* 5. Data Transfer Outside the European Union */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              5. Data Transfer Outside the European Union
            </Text>
            <Text as="p" variant="bodyMd">
              As our cloud infrastructure (Vercel, Railway) is internationally
              distributed, some data may be transferred outside the European
              Union. These transfers are governed by contractual safeguards
              (such as the European Commission’s Standard Contractual Clauses)
              and security measures in accordance with GDPR requirements.
            </Text>
          </BlockStack>

          {/* 6. Data Sharing */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              6. Data Sharing
            </Text>
            <Text as="p" variant="bodyMd">
              No collected data is sold, rented, or shared with third parties
              who are not essential to the operation of the App.
            </Text>
          </BlockStack>

          {/* 7. Data Retention Period */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              7. Data Retention Period
            </Text>
            <Text as="p" variant="bodyMd">
              Personal data collected is retained for the duration of the
              business relationship and archived for a period of three (3) years
              after the last interaction or order, in accordance with legal and
              regulatory obligations.
            </Text>
          </BlockStack>

          {/* 8. Your Rights */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              8. Your Rights
            </Text>
            <List type="bullet">
              <List.Item>
                <Text as="span" variant="bodyMd">
                  You have the right to access your data.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  You have the right to rectify inaccurate data.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  You have the right to erasure of your data.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  You have the right to restrict processing of your data.
                </Text>
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              To exercise these rights, please contact us at contact@99knit.com.
            </Text>
          </BlockStack>

          {/* 9. GDPR Compliance */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              9. GDPR Compliance
            </Text>
            <List type="bullet">
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Legal Basis for Processing: Performance of contract and
                  legitimate interest.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Sub-processors: Railway, Vercel, NeonDB, Redis, Qstash.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  Data Protection Officer: Mr. Reynaud.
                </Text>
              </List.Item>
              <List.Item>
                <Text as="span" variant="bodyMd">
                  No automated decision-making or profiling.
                </Text>
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              For any questions regarding GDPR compliance, contact
              contact@99knit.com.
            </Text>
          </BlockStack>

          {/* 10. Contact */}
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              10. Contact
            </Text>
            <Text as="p" variant="bodyMd">
              For any questions, complaints, or requests regarding this privacy
              policy, you can contact us at contact@99knit.com.
            </Text>
          </BlockStack>
        </BlockStack>
      </Card>
    </Page>
  );
}
