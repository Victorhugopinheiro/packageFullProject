export interface WorkerProfile {
    phone: string;
    pricePerPackage: number;
    image: string;
    address: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: "WORKER" | string;
    createdAt: string;
    updatedAt: string;
    workerProfile: WorkerProfile;
}

export interface GetMyEmployeesResponse {
    employees: Employee[];
}