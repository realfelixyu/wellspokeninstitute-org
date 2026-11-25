import Link from "next/link";
import { BOARD, SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Governance and legal status",
  description: `Legal status, tax-exempt determination, board of directors, and governing policies of ${SITE.name}.`,
  path: "/governance",
});

export default function GovernancePage() {
  return (
    <>
      <PageHeader eyebrow="Governance" title="Governance and legal status" />
      <Prose>
        <div className="table-wrap not-prose">
          <table className="w-full text-[0.95rem]">
            <tbody>
              {[
                ["Legal name", SITE.legalName],
                ["Entity", `${SITE.entityType}, incorporated ${formatDate(SITE.incorporated)}`],
                ["Federal tax status", `Exempt under section 501(c)(3) of the Internal Revenue Code`],
                ["Foundation status", SITE.foundationClass],
                ["IRS determination letter", `Dated ${formatDate(SITE.determinationLetterDate)}, effective ${formatDate(SITE.exemptionEffectiveDate)}`],
                ["EIN", SITE.ein],
                ["Mailing address", `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`],
                ["Fiscal year", "January 1 to December 31"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-48 align-top">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Board of directors and officers</h2>
        <ul>
          {BOARD.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>, {p.role}
            </li>
          ))}
        </ul>
        <p>
          The board intends to add independent directors and an outside research advisory council. We will list
          them here as they join.
        </p>
        <h2>Governing policies</h2>
        <ul>
          <li>
            <strong>Conflict of interest policy.</strong> Directors and officers must disclose any financial interest
            in a matter before the board and may not vote on it. The policy applies in particular to any matter
            involving an organization a director or officer owns or controls.
          </li>
          <li>
            <strong>Editorial and research independence.</strong> See our{" "}
            <Link href="/editorial-policy">editorial and research policy</Link>.
          </li>
          <li>
            <strong>Funding and relationships.</strong> See <Link href="/disclosures">funding and disclosures</Link>.
          </li>
        </ul>
        <h2>Public filings</h2>
        <p>
          Read the <a href="/governance/irs-determination-letter.pdf">IRS determination letter (PDF)</a>.
          To request an available annual filing, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </>
  );
}
