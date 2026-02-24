import Applicants from "@/components/applicants/applicants";
import React, { use } from "react";

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div>
      <Applicants id={id} />
    </div>
  );
}
