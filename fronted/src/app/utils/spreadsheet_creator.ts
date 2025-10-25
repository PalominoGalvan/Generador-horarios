interface TeacherInfo {
    firstName: string;
    lastName: string;
}

interface AvailabilityData {
    teacherId: TeacherInfo;
    naming: number;
    archHours: number;
    availability: string[];
    desiredSubjects: string[];
    hasAdministrativePos: boolean;
}

export default function exportAvailabilities(data: AvailabilityData[]) {}