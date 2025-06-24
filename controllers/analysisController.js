import Company from "../models/companyModel.js";
import Survey from "../models/surveyModels.js";
import Dashboard from "../models/dashboardModel.js";

export const analysisAndClusteringByCompanyID = async (req, res) => {
    const { companyId } = req.params;

    try {
        // Find the company by ID
        const company = await Company.findOne({ _id: companyId });

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Find the dashboard data for the company
        const dashboard = await Dashboard.findOne({ companyId: company._id });
        if (!dashboard) {
            return res.status(404).json({ error: "Dashboard data not found" });
        }

        const participationByDepartment = dashboard.participationByDepartment || {};

        // Definición de clusters
        const clusters = [
            {
                id: "content-creators",
                name: "Creadores de Contenido",
                description: "Usuarios que crean documentos, presentaciones y materiales de comunicación",
                departments: ["marketing", "rh", "ventas"],
                mainTasks: ["Redacción", "Diseño", "Presentaciones"],
                recommendedTools: ["ChatGPT", "Canva AI", "Gamma"],
                roi: "???"
            },
            {
                id: "data-analysts",
                name: "Analistas de Datos",
                description: "Profesionales que trabajan con análisis de información y reportes",
                departments: ["finanzas", "it", "operaciones"],
                mainTasks: ["Análisis", "Reportes", "Dashboards"],
                recommendedTools: ["Microsoft Copilot", "Tableau AI", "Power BI"],
                roi: "???"
            },
            {
                id: "communicators",
                name: "Comunicadores",
                description: "Roles enfocados en comunicación interna y externa",
                departments: ["rh", "marketing", "atencionclientes"],
                mainTasks: ["Emails", "Social Media", "Atención al Cliente"],
                recommendedTools: ["Jasper", "Zendesk AI", "HubSpot AI"],
                roi: "???"
            },
            {
                id: "process-optimizers",
                name: "Optimizadores de Procesos",
                description: "Usuarios que buscan automatizar procesos operativos",
                departments: ["operaciones", "legal", "compras"],
                mainTasks: ["Automatización", "Workflows", "Documentación"],
                recommendedTools: ["Zapier", "Power Automate", "UiPath"],
                roi: "???"
            }
        ];

        // Procesar cada cluster
        const processedClusters = clusters.map(cluster => {
            // Calcular métricas del cluster
            let totalAutomation = 0;
            let totalDepartments = 0;
            let totalResponses = 0;
            const departmentsDetails = [];

            // Procesar cada departamento en el cluster
            cluster.departments.forEach(deptKey => {
                const deptData = participationByDepartment[deptKey] || { mean: 0, total: 0 };
                
                if (deptData.total > 0) {
                    totalAutomation += deptData.mean;
                    totalDepartments++;
                    totalResponses += deptData.total;
                }

                // Mapear nombres de departamentos más legibles
                let displayName;
                switch(deptKey) {
                    case "rh": displayName = "Recursos Humanos"; break;
                    case "it": displayName = "IT"; break;
                    case "atencionclientes": displayName = "Atención al Cliente"; break;
                    case "operaciones": displayName = "Operaciones"; break;
                    case "ventas": displayName = "Ventas"; break;
                    case "compras": displayName = "Compras"; break;
                    case "finanzas": displayName = "Finanzas"; break;
                    case "legal": displayName = "Legal"; break;
                    case "marketing": displayName = "Marketing"; break;
                    default: displayName = deptKey;
                }

                departmentsDetails.push({
                    name: displayName,
                    automationPotential: deptData.mean,
                    responses: deptData.total,
                    key: deptKey
                });
            });

            // Calcular promedio de automatización del cluster
            const clusterAutomation = totalDepartments > 0 
                ? totalAutomation / totalDepartments 
                : 0;

            // Determinar prioridad basada en el potencial de automatización
            let priority;
            if (clusterAutomation >= 50) {
                priority = "Alta";
            } else if (clusterAutomation >= 20) {
                priority = "Media";
            } else {
                priority = "Baja";
            }

            return {
                ...cluster,
                departmentsDetails,
                totalResponses,
                size: totalResponses,
                averageAutomationPotential: parseFloat(clusterAutomation.toFixed(2)),
                priority,
                
            };
        });

        return res.status(200).json({
            success: true,
            clusters: processedClusters,
        });

    } catch (error) {
        console.error("Error fetching analysis and clustering data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

