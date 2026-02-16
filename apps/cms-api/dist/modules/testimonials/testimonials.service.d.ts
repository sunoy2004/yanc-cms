import { SupabaseService } from '../../supabase/supabase.service';
import { CreateTestimonialDto } from '../../dtos/testimonial.dto';
import { UpdateTestimonialDto } from '../../dtos/testimonial-update.dto';
export declare class TestimonialsService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getTestimonials(): Promise<any[]>;
    createTestimonial(dto: CreateTestimonialDto): Promise<any[]>;
    updateTestimonial(id: string, dto: UpdateTestimonialDto): Promise<any[]>;
    deleteTestimonial(id: string): Promise<boolean>;
}
