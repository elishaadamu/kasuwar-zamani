"use client";
import React, { Suspense } from "react";
import MyTeamDashboardView from "@/components/MyTeamDashboardView";
import { useSearchParams } from "next/navigation";

const TeamDetailsContent = () => {
    const searchParams = useSearchParams();
    const teamId = searchParams.get("id");

    return <MyTeamDashboardView teamId={teamId} />;
};

const TeamDetailsPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeamDetailsContent />
        </Suspense>
    );
};

export default TeamDetailsPage;
