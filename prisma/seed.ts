import {
  DocumentCategory,
  DocumentStatus,
  MembershipRole,
  PrismaClient,
  RequirementArea,
  RequirementSeverity,
  RequirementStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const adminEmails = (process.env.ENTIX_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "entix-demo" },
    update: {},
    create: {
      name: "Entix Demo Organization",
      slug: "entix-demo",
      countryCode: "SA"
    }
  });

  await Promise.all(
    adminEmails.map((email) =>
      prisma.inviteAllowlist.upsert({
        where: { email },
        update: {
          organizationId: organization.id,
          role: MembershipRole.PLATFORM_ADMIN,
          status: "ACTIVE"
        },
        create: {
          email,
          organizationId: organization.id,
          role: MembershipRole.PLATFORM_ADMIN
        }
      })
    )
  );

  const company = await prisma.company.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000001"
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      organizationId: organization.id,
      legalName: "Demo Operating Company LLC",
      tradeName: "DemoCo",
      jurisdiction: "SA",
      healthScore: 73,
      profileCompletion: 45
    }
  });

  const requirements = [
    [RequirementArea.BASIC_INFO, "Complete company legal profile", RequirementStatus.IN_PROGRESS, RequirementSeverity.MEDIUM],
    [RequirementArea.LEGAL_REGISTRATION, "Upload commercial registration", RequirementStatus.MISSING, RequirementSeverity.CRITICAL],
    [RequirementArea.GOVERNANCE, "Add board and ownership records", RequirementStatus.MISSING, RequirementSeverity.HIGH],
    [RequirementArea.FINANCE, "Connect accounting source", RequirementStatus.IN_PROGRESS, RequirementSeverity.HIGH],
    [RequirementArea.OPERATIONS, "Assign operations owner", RequirementStatus.COMPLETE, RequirementSeverity.LOW],
    [RequirementArea.TECHNOLOGY, "Confirm access and systems inventory", RequirementStatus.IN_PROGRESS, RequirementSeverity.MEDIUM],
    [RequirementArea.COMPLIANCE_RISK, "Add compliance risk review", RequirementStatus.MISSING, RequirementSeverity.HIGH]
  ] as const;

  for (const [area, title, status, severity] of requirements) {
    await prisma.companyRequirement.upsert({
      where: {
        companyId_area_title: {
          companyId: company.id,
          area,
          title
        }
      },
      update: {
        status,
        severity
      },
      create: {
        companyId: company.id,
        area,
        title,
        status,
        severity,
        source: "seed"
      }
    });
  }

  const documents = [
    ["Commercial Registration", DocumentCategory.COMMERCIAL_REGISTRATION, DocumentStatus.MISSING],
    ["Tax Certificate", DocumentCategory.TAX_CERTIFICATE, DocumentStatus.REVIEW_REQUIRED],
    ["Articles of Association", DocumentCategory.ARTICLES_OF_ASSOCIATION, DocumentStatus.VALID]
  ] as const;

  for (const [title, category, status] of documents) {
    await prisma.companyDocument.upsert({
      where: {
        companyId_category_title: {
          companyId: company.id,
          category,
          title
        }
      },
      update: { status },
      create: {
        companyId: company.id,
        title,
        category,
        status
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
