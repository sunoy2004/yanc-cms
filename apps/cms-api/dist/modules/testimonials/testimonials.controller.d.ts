import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from '../../dtos/testimonial.dto';
import { UpdateTestimonialDto } from '../../dtos/testimonial-update.dto';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    getPublicTestimonials(): Promise<any[]>;
    createTestimonial(createTestimonialDto: CreateTestimonialDto): Promise<any[]>;
    updateTestimonial(id: string, updateTestimonialDto: UpdateTestimonialDto): Promise<any[]>;
    deleteTestimonial(id: string): Promise<boolean>;
    togglePublish(id: string, published: boolean): Promise<any[]>;
}
