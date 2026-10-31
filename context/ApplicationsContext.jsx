
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshApplications = async () => {
    if (!currentUser?.id) {
      setApplications([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("applicant_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Applications error:", error.message);
    } else {
      setApplications(
        (data || []).map((item) => ({
          id: item.id,
          jobId: item.job_id,
          status: item.status,
          appliedAt: item.created_at,
          details: {
            fullName: item.full_name,
            email: item.email,
            note: item.note,
            attachmentPaths: item.attachment_paths,
          },
        }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!currentUser?.id) {
        setApplications([]);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("applicant_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.log("Applications error:", error.message);
      } else {
        setApplications(
          (data || []).map((item) => ({
            id: item.id,
            jobId: item.job_id,
            status: item.status,
            appliedAt: item.created_at,
            details: {
              fullName: item.full_name,
              email: item.email,
              note: item.note,
              attachmentPaths: item.attachment_paths,
            },
          }))
        );
      }

      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  const hasApplied = (jobId) =>
    applications.some(
      (item) => String(item.jobId) === String(jobId)
    );

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        hasApplied,
        refreshApplications,
        loading,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);

  if (!context) {
    throw new Error(
      "useApplications must be used inside ApplicationsProvider."
    );
  }

  return context;
}
