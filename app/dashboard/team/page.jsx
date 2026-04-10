"use client";
import React, { Suspense } from "react";
import MyTeamDashboardView from "@/components/MyTeamDashboardView";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";

const TeamDetailsContent = () => {
    const searchParams = useSearchParams();
    const teamId = searchParams.get("id");

    return <MyTeamDashboardView teamId={teamId} />;
};

const TeamDetailsPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <TeamDetailsContent />
        </Suspense>
    );
};

export default TeamDetailsPage;
