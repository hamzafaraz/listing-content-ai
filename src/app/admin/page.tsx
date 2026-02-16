"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Loader2, Users, FileText, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!user || userEmail !== adminEmail) {
            router.push("/"); // Redirect unauthorized users
            return;
        }

        fetchData();
    }, [isLoaded, user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch stats
            const { count: userCount } = await supabase.from("subscribers").select("*", { count: "exact", head: true });
            const { count: projectCount } = await supabase.from("projects").select("*", { count: "exact", head: true });

            setStats({
                totalUsers: userCount || 0,
                totalProjects: projectCount || 0,
            });

            // Fetch pending approvals
            const { data: pendingData } = await supabase
                .from("subscriptions")
                .select("*")
                .eq('status', 'pending_approval')
                .order("created_at", { ascending: false });

            if (pendingData) setRecentUsers(pendingData);

            // Fetch recent projects
            const { data: projectsData } = await supabase
                .from("projects")
                .select("id, project_name, created_at, user_id")
                .order("created_at", { ascending: false })
                .limit(5);

            if (projectsData) setRecentProjects(projectsData);

        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, userId: string) => {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('id', id);

        if (!error) {
            alert('User approved!');
            fetchData(); // Refresh list
        } else {
            console.error(error);
            alert('Error approving user.');
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        Welcome back, Admin
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase">Total Subscribers</p>
                            <p className="text-4xl font-black text-gray-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase">Total Projects</p>
                            <p className="text-4xl font-black text-gray-900">{stats.totalProjects}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Approvals */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{recentUsers.length} Pending</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentUsers.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No pending requests.</div>
                            ) : (
                                recentUsers.map((sub) => (
                                    <div key={sub.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{sub.customer_name || 'Unknown User'}</p>
                                            <p className="text-sm text-gray-600">{sub.plan_name} - {sub.price}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="block">Email: {sub.customer_email}</span>
                                                <span className="block">WhatsApp: {sub.customer_whatsapp}</span>
                                                <span className="block">Date: {new Date(sub.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleApprove(sub.id, sub.user_id)}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Recent Projects</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentProjects.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No projects yet.</div>
                            ) : (
                                recentProjects.map((project) => (
                                    <div key={project.id} className="p-4 hover:bg-gray-50 transition">
                                        <p className="font-medium text-gray-800">{project.project_name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-500">User ID: {project.user_id.slice(0, 8)}...</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
