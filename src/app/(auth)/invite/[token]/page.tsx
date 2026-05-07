"use client";

import { useState } from "react";

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // TODO: resolve token, show invite details + accept form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Workspace Invitation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Accept your invitation to join the team
        </p>
      </div>
      {/* TODO: render after resolving params */}
      <div className="text-center text-sm text-muted-foreground py-8">
        Loading invitation details...
      </div>
    </div>
  );
}
