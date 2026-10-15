export interface CourseAuthor {
  name: string;
  photo: string | null;
}

export interface CourseContent {
  id: number;
  course_id: number;
  title: string;
  youtube: string;
  created_at: string;
  updated_at: string;
  my_status_finished: boolean;
}

export interface CourseRating {
  name: string;
  ratings: number;
  comment: string;
}

export interface CourseSummary {
  id: number;
  user_id: number;
  title: string;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: CourseAuthor;
  students: number[];
  total_contents: number;
  avg_ratings: string | null;
}

export interface CourseDetail extends CourseSummary {
  contents: CourseContent[];
  ratings: CourseRating[];
  my_percentage_finished: string;
}

export type ContentStatus = 0 | 1;
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface CoursePayload {
  title: string;
  description: string;
}

export interface ContentPayload {
  title: string;
  youtube: string;
}

export interface RatingPayload {
  ratings: RatingValue;
  comment: string;
}
