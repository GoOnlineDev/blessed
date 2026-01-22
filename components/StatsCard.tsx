"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: string;
        isUp: boolean;
    };
    color?: "indigo" | "emerald" | "amber" | "rose";
}

export default function StatsCard({ title, value, icon, trend, color = "indigo" }: StatsCardProps) {
    const iconColorMap = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
        <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all duration-300">
            <CardContent className="p-3 sm:p-5 lg:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4 lg:mb-5">
                    <div className={cn(
                        "p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                        iconColorMap[color]
                    )}>
                        {icon}
                    </div>
                    {trend && (
                        <Badge
                            variant={trend.isUp ? "success" : "danger"}
                            className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md"
                        >
                            {trend.isUp ? "↑" : "↓"} {trend.value}
                        </Badge>
                    )}
                </div>
                <div>
                    <h3 className="text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{title}</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight truncate">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
