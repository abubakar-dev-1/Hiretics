"use client";

import { useState, useEffect } from "react";
import { CardComponent } from "./DynamicCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle,
  UploadCloud,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "./StepIndicator";
import { createCampaign, getCampaign } from "@/api/campaign/api";
import { toast } from "sonner";
import { TagInput } from "./TagInput";
import { SkillTagInput } from "./SkillTagInput";
import { CampaignCriteria, SkillCriterion } from "@/types/campaign";

type CreateCampaignProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    title: string;
    company: string;
    role: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    id?: string;
    criteria?: CampaignCriteria;
  };
  editMode?: boolean;
  onSave?: (data: any) => Promise<void>;
  setInitialValues?: (values: any) => void;
  campaignId?: string;
  onCreated?: () => void;
};

const emptyCriteria: CampaignCriteria = {
  required_skills: [],
  preferred_universities: [],
  minimum_cgpa: 0,
  preferred_cities: [],
  minimum_experience_years: 0,
  required_keywords: [],
};

export default function CreateCampaign({
  open,
  onOpenChange,
  initialValues,
  editMode = false,
  onSave,
  setInitialValues,
  campaignId,
  onCreated,
}: CreateCampaignProps) {
  const [step, setStep] = useState<number>(1);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    title: initialValues?.title || "",
    company: initialValues?.company || "",
    role: initialValues?.role || "",
    description: initialValues?.description || "",
    startDate: initialValues?.startDate || null,
    endDate: initialValues?.endDate || null,
    criteria: initialValues?.criteria || { ...emptyCriteria },
  });
  const [errors, setErrors] = useState<any>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && initialValues) {
      setFormData({
        title: initialValues.title || "",
        company: initialValues.company || "",
        role: initialValues.role || "",
        description: initialValues.description || "",
        startDate: initialValues.startDate || null,
        endDate: initialValues.endDate || null,
        criteria: initialValues.criteria || { ...emptyCriteria },
      });
      setStep(1);
      setErrors({});
      setShowValidationError(false);
    }
  }, [open, initialValues]);

  const validateStep = () => {
    const newErrors: any = {};
    if (step === 1) {
      if (!formData.title) newErrors.title = "Required";
      if (!formData.company) newErrors.company = "Required";
      if (!formData.startDate || !formData.endDate)
        newErrors.dates = "Required";
      else if (formData.startDate > formData.endDate)
        newErrors.dates = "Start date must be before or equal to end date";
    } else if (step === 2) {
      if (!formData.role) newErrors.role = "Required";
      if (!formData.description) newErrors.description = "Required";
    }
    // Step 3 has no required fields (criteria is optional)
    setErrors(newErrors);
    setShowValidationError(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setShowValidationError(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setErrors({});
      setShowValidationError(false);
    } else if (step === 3) {
      setStep(2);
      setErrors({});
      setShowValidationError(false);
    } else {
      setShowAlert(true);
    }
  };

  const handleClose = () => {
    setShowAlert(false);
    onOpenChange(false);
    setStep(1);
    setFormData({
      title: "",
      company: "",
      role: "",
      description: "",
      startDate: null,
      endDate: null,
      criteria: { ...emptyCriteria },
    });
    setErrors({});
    setShowValidationError(false);
  };

  const hasCriteria = (criteria: CampaignCriteria): boolean => {
    return (
      criteria.required_skills.length > 0 ||
      criteria.required_keywords.length > 0 ||
      criteria.preferred_universities.length > 0 ||
      criteria.preferred_cities.length > 0 ||
      criteria.minimum_experience_years > 0 ||
      criteria.minimum_cgpa > 0
    );
  };

  const handleCreateOrSave = async () => {
    setIsLoading(true);
    const criteriaPayload = hasCriteria(formData.criteria)
      ? formData.criteria
      : undefined;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const campaignData: any = {
      user_id: user.id,
      name: formData.title,
      company_name: formData.company,
      job_role: formData.role,
      job_description: formData.description,
      start_date: formData.startDate
        ? format(formData.startDate, "yyyy-MM-dd")
        : undefined,
      end_date: formData.endDate
        ? format(formData.endDate, "yyyy-MM-dd")
        : undefined,
    };

    if (criteriaPayload) {
      campaignData.criteria = criteriaPayload;
    }

    try {
      if (editMode && onSave) {
        await onSave(campaignData);
        toast.success("Campaign Updated successfully");
        setStep(4);
        setShowValidationError(false);
        if (setInitialValues && campaignId) {
          const updated = await getCampaign(campaignId);
          setInitialValues({
            title: updated.name,
            company: updated.company_name,
            role: updated.job_role,
            description: updated.job_description,
            startDate: updated.start_date
              ? new Date(updated.start_date)
              : null,
            endDate: updated.end_date ? new Date(updated.end_date) : null,
            id: updated.id,
            criteria: updated.criteria,
          });
        }
      } else {
        await createCampaign(campaignData);
        setStep(4);
        setShowValidationError(false);
        if (onCreated) onCreated();
        if (setInitialValues && campaignId) {
          const updated = await getCampaign(campaignId);
          setInitialValues({
            title: updated.name,
            company: updated.company_name,
            role: updated.job_role,
            description: updated.job_description,
            startDate: updated.start_date
              ? new Date(updated.start_date)
              : null,
            endDate: updated.end_date ? new Date(updated.end_date) : null,
            id: updated.id,
            criteria: updated.criteria,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to save campaign");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCriteria = (updates: Partial<CampaignCriteria>) => {
    setFormData({
      ...formData,
      criteria: { ...formData.criteria, ...updates },
    });
  };

  return (
    <div className="p-6">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6 bg-card rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-primary">
              {editMode ? "Edit Campaign" : "Create Campaign"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Campaign Specifics"
                : step === 2
                ? "Job Specifics"
                : step === 3
                ? "Scoring Criteria (Optional)"
                : ""}
            </p>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Title
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Title of your Campaign"
                  className="h-10 border-input focus:border-primary focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown as the campaign heading to the applicants.
                </p>
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Campaign Duration
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal h-10",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate
                          ? format(formData.startDate, "PPP")
                          : "Start Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate ?? undefined}
                        onSelect={(date) =>
                          setFormData({ ...formData, startDate: date ?? null })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal h-10",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate
                          ? format(formData.endDate, "PPP")
                          : "End Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate ?? undefined}
                        onSelect={(date) =>
                          setFormData({ ...formData, endDate: date ?? null })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.dates && (
                  <p className="text-xs text-red-500">{errors.dates}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Company Name
                </Label>
                <Input
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Name of your Company"
                  className="h-10 border-input focus:border-primary focus:ring-primary"
                />
                {errors.company && (
                  <p className="text-xs text-red-500">{errors.company}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Company Avatar
                </Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                      {formData.company.trim().charAt(0).toUpperCase() || "CN"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Role Required
                </Label>
                <Input
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Name of the Role"
                  className="h-10 border-input focus:border-primary focus:ring-primary"
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Job Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Type your message here"
                  className="min-h-[120px] border-input focus:border-primary focus:ring-primary resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Required Skills
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add skills with importance weights (1-5)
                </p>
                <SkillTagInput
                  skills={formData.criteria.required_skills}
                  onChange={(skills) =>
                    updateCriteria({ required_skills: skills })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Required Keywords
                </Label>
                <TagInput
                  tags={formData.criteria.required_keywords}
                  onChange={(keywords) =>
                    updateCriteria({ required_keywords: keywords })
                  }
                  placeholder="e.g. agile, scrum, remote"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary">
                    Min Experience (years)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.criteria.minimum_experience_years || ""}
                    onChange={(e) =>
                      updateCriteria({
                        minimum_experience_years:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary">
                    Min CGPA
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={4}
                    step={0.1}
                    value={formData.criteria.minimum_cgpa || ""}
                    onChange={(e) =>
                      updateCriteria({
                        minimum_cgpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.0"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Preferred Universities
                </Label>
                <TagInput
                  tags={formData.criteria.preferred_universities}
                  onChange={(unis) =>
                    updateCriteria({ preferred_universities: unis })
                  }
                  placeholder="e.g. LUMS, NUST, FAST"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Preferred Cities
                </Label>
                <TagInput
                  tags={formData.criteria.preferred_cities}
                  onChange={(cities) =>
                    updateCriteria({ preferred_cities: cities })
                  }
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center pt-6">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[#16A34A] rounded-full">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-xl font-semibold text-primary">
                {editMode ? "Campaign Updated" : "New Campaign Created"}
              </p>
            </div>
          )}

          {step < 4 && <StepIndicator step={step} totalSteps={3} />}

          {/* Unified Buttons below the step indicator and content */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) handleClose();
                else if (step === 2 || step === 3) handleBack();
                else if (step === 4) handleClose();
              }}
              className="px-6 cursor-pointer"
            >
              {step === 1 ? "Cancel" : step === 4 ? "Close" : "Back"}
            </Button>
            {step < 4 && (
              <div className="flex gap-2">
                {step === 3 && (
                  <Button
                    variant="outline"
                    onClick={handleCreateOrSave}
                    className="px-4 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Skip & Create"}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (step === 1 || step === 2) handleNext();
                    else if (step === 3) handleCreateOrSave();
                  }}
                  className="bg-[#16A34A] text-white hover:bg-[#16A34A]/80 px-6 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading && step === 3 ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      {editMode ? "Updating..." : "Creating..."}
                    </span>
                  ) : step === 1 || step === 2 ? (
                    "Next"
                  ) : editMode ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will cancel this campaign
              creation process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <Button onClick={handleClose} variant="destructive">
              Yes, Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
