export interface SelectOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

export interface UploadResourceFormValues {
  file: File;
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorIds: string[];
  bannerImage: File | null;
}
