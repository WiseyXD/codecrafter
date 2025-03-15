"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Building,
  User,
  Shield,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Import shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Import types
import {
  OnboardingFormData,
  FormErrors,
  SecurityZone,
  FormStep,
  ZonePriority,
  MonitoringHours,
  InitialSensors,
  NotificationType,
} from "@/lib/types";

const AdminOnboardingForm: React.FC = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formStep, setFormStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    // City Information
    cityName: "",
    region: "",
    country: "",
    population: "",

    // Admin Information
    adminName: session?.user?.name || "", // Default to empty string if undefined
    adminEmail: session?.user?.email || "", // Default to empty string if undefined
    adminPhone: "",
    adminDepartment: "",

    // System Configuration
    securityZones: [],
    initialSensors: "5",
    monitoringHours: "24/7",

    // Confirmation
    agreeToTerms: false,
    notificationType: "email",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateFormData = <K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K],
  ): void => {
    setFormData({
      ...formData,
      [key]: value,
    });

    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors({
        ...errors,
        [key]: undefined,
      });
    }
  };
  const validateStep = (step: FormStep): boolean => {
    const stepErrors: FormErrors = {};
    let isValid = true;

    if (step === 0) {
      // Validate City Information
      if (!formData.cityName.trim()) {
        stepErrors.cityName = "City name is required";
        isValid = false;
      }

      if (!formData.country.trim()) {
        stepErrors.country = "Country is required";
        isValid = false;
      }
    } else if (step === 1) {
      // Validate Admin Information

      if (!formData.adminDepartment.trim()) {
        stepErrors.adminDepartment = "Department is required";
        isValid = false;
      }
    } else if (step === 2) {
      // Validate System Configuration
      if (formData.securityZones.length === 0) {
        stepErrors.securityZones = "At least one security zone is required";
        isValid = false;
      }
    } else if (step === 3) {
      // Validate Confirmation
      if (!formData.agreeToTerms) {
        stepErrors.agreeToTerms = "You must agree to the terms";
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = (): void => {
    if (validateStep(formStep) && formStep < 3) {
      setFormStep((prev) => (prev < 3 ? ((prev + 1) as FormStep) : prev));
    }
  };

  const prevStep = (): void => {
    if (formStep > 0) {
      setFormStep((prev) => (prev > 0 ? ((prev - 1) as FormStep) : prev));
    }
  };

  const addSecurityZone = (): void => {
    const newZone: SecurityZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${formData.securityZones.length + 1}`,
      description: "",
      priority: "medium",
    };

    updateFormData("securityZones", [...formData.securityZones, newZone]);

    // Clear zone error if it exists
    if (errors.securityZones) {
      setErrors({
        ...errors,
        securityZones: undefined,
      });
    }
  };

  const updateZone = (
    zoneId: string,
    field: keyof SecurityZone,
    value: string,
  ): void => {
    const updatedZones = formData.securityZones.map((zone) => {
      if (zone.id === zoneId) {
        return { ...zone, [field]: value };
      }
      return zone;
    });

    updateFormData("securityZones", updatedZones);
  };

  const removeZone = (zoneId: string): void => {
    const updatedZones = formData.securityZones.filter(
      (zone) => zone.id !== zoneId,
    );
    updateFormData("securityZones", updatedZones);
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (!validateStep(formStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Update session to reflect onboarded status
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          isOnboarded: true,
        },
      });

      // Refresh session data
      // try {
      //   await fetch("/api/auth/refresh", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   });
      // } catch (error) {
      //   console.warn("Session refresh API error:", error);
      // }

      // Move to success step
      setFormStep(4);
      toast.success("Onboarding completed successfully!");
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = async (): Promise<void> => {
    // Ensure session is updated before navigation
    await updateSession();
    router.push("/dashboard");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            <CardTitle className="text-2xl">
              Smart City Surveillance Setup
            </CardTitle>
          </div>
          <CardDescription>
            Complete this form to set up your smart city surveillance system
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              {["City Info", "Admin Details", "System Setup", "Confirm"].map(
                (step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        formStep >= index
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {formStep > index ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1">{step}</span>
                  </div>
                ),
              )}
            </div>
            <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
              <div
                className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(formStep / 3) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={onSubmit}>
            {/* Step 1: City Information */}
            {formStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">City Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cityName">City Name*</Label>
                    <Input
                      id="cityName"
                      placeholder="Enter city name"
                      value={formData.cityName}
                      onChange={(e) =>
                        updateFormData("cityName", e.target.value)
                      }
                      className={errors.cityName ? "border-red-500" : ""}
                    />
                    {errors.cityName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.cityName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region/State</Label>
                    <Input
                      id="region"
                      placeholder="Enter region or state"
                      value={formData.region}
                      onChange={(e) => updateFormData("region", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country*</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={(e) =>
                        updateFormData("country", e.target.value)
                      }
                      className={errors.country ? "border-red-500" : ""}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="population">Population</Label>
                    <Input
                      id="population"
                      placeholder="Approximate population"
                      type="number"
                      value={formData.population}
                      onChange={(e) =>
                        updateFormData("population", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Information */}
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">
                    Administrator Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name*</Label>
                  <Input
                    id="adminName"
                    placeholder="Your name"
                    value={formData.adminName}
                    disabled={true}
                    className={errors.adminName ? "border-red-500" : ""}
                  />
                  {errors.adminName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.adminName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address*</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    disabled={true}
                    className={errors.adminEmail ? "border-red-500" : ""}
                  />
                  {errors.adminEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.adminEmail}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Phone Number</Label>
                    <Input
                      id="adminPhone"
                      placeholder="Enter phone number"
                      value={formData.adminPhone}
                      onChange={(e) =>
                        updateFormData("adminPhone", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminDepartment">
                      Department/Division*
                    </Label>
                    <Input
                      id="adminDepartment"
                      placeholder="e.g., Public Safety, IT"
                      value={formData.adminDepartment}
                      onChange={(e) =>
                        updateFormData("adminDepartment", e.target.value)
                      }
                      className={errors.adminDepartment ? "border-red-500" : ""}
                    />
                    {errors.adminDepartment && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.adminDepartment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: System Configuration */}
            {formStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">Security Zones</h3>
                </div>

                {errors.securityZones && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-200 text-red-800"
                  >
                    <AlertDescription>{errors.securityZones}</AlertDescription>
                  </Alert>
                )}

                {formData.securityZones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      No security zones defined yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={addSecurityZone}
                    >
                      Add Your First Zone
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.securityZones.map((zone, index) => (
                      <div key={zone.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Zone {index + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={zone.priority}
                              onValueChange={(value: ZonePriority) =>
                                updateZone(zone.id, "priority", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeZone(zone.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor={`zone-name-${zone.id}`}>
                              Zone Name
                            </Label>
                            <Input
                              id={`zone-name-${zone.id}`}
                              value={zone.name}
                              onChange={(e) =>
                                updateZone(zone.id, "name", e.target.value)
                              }
                              placeholder="e.g., Downtown, City Center, North Perimeter"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`zone-desc-${zone.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`zone-desc-${zone.id}`}
                              value={zone.description}
                              onChange={(e) =>
                                updateZone(
                                  zone.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Describe this zone and its security requirements"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSecurityZone}
                      className="w-full"
                    >
                      Add Another Zone
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="initialSensors">
                      Initial Sensors per Zone
                    </Label>
                    <Select
                      value={formData.initialSensors}
                      onValueChange={(value: InitialSensors) =>
                        updateFormData("initialSensors", value)
                      }
                    >
                      <SelectTrigger id="initialSensors">
                        <SelectValue placeholder="Select number of sensors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 sensors (minimum)</SelectItem>
                        <SelectItem value="5">
                          5 sensors (recommended)
                        </SelectItem>
                        <SelectItem value="10">
                          10 sensors (comprehensive)
                        </SelectItem>
                        <SelectItem value="custom">
                          Custom configuration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monitoringHours">Monitoring Hours</Label>
                    <Select
                      value={formData.monitoringHours}
                      onValueChange={(value: MonitoringHours) =>
                        updateFormData("monitoringHours", value)
                      }
                    >
                      <SelectTrigger id="monitoringHours">
                        <SelectValue placeholder="Select monitoring hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24/7">
                          24/7 (continuous monitoring)
                        </SelectItem>
                        <SelectItem value="business">
                          Business hours only
                        </SelectItem>
                        <SelectItem value="night">Night time only</SelectItem>
                        <SelectItem value="custom">Custom schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {formStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <Check className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">Confirmation</h3>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTitle>Ready to complete setup</AlertTitle>
                  <AlertDescription>
                    Please review your information below before submitting
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="text-sm font-medium">City Name:</div>
                    <div className="text-sm">{formData.cityName}</div>

                    <div className="text-sm font-medium">Region:</div>
                    <div className="text-sm">{formData.region || "—"}</div>

                    <div className="text-sm font-medium">Country:</div>
                    <div className="text-sm">{formData.country}</div>

                    <div className="text-sm font-medium">Administrator:</div>
                    <div className="text-sm">{formData.adminName}</div>

                    <div className="text-sm font-medium">Email:</div>
                    <div className="text-sm">{formData.adminEmail}</div>

                    <div className="text-sm font-medium">Department:</div>
                    <div className="text-sm">{formData.adminDepartment}</div>

                    <div className="text-sm font-medium">Security Zones:</div>
                    <div className="text-sm">
                      {formData.securityZones.length}
                    </div>

                    <div className="text-sm font-medium">Initial Sensors:</div>
                    <div className="text-sm">
                      {formData.initialSensors} per zone
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked: boolean) =>
                        updateFormData("agreeToTerms", checked)
                      }
                      className={errors.agreeToTerms ? "border-red-500" : ""}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the terms of service and privacy policy for the
                      Smart City Surveillance System
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">
                    Notification Preferences
                  </p>
                  <RadioGroup
                    value={formData.notificationType}
                    onValueChange={(value: NotificationType) =>
                      updateFormData("notificationType", value)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="notifyEmail" />
                      <Label htmlFor="notifyEmail" className="text-sm">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="notifySms" />
                      <Label htmlFor="notifySms" className="text-sm">
                        SMS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="notifyBoth" />
                      <Label htmlFor="notifyBoth" className="text-sm">
                        Both
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Success Step */}
            {formStep === 4 && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Setup Completed!</h3>
                <p className="text-center text-gray-500 mb-6">
                  Your Smart City Surveillance System has been configured
                  successfully. You can now access the dashboard to monitor your
                  city.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                  <Button variant="outline" onClick={goToDashboard}>
                    View Dashboard
                  </Button>
                  <Button onClick={() => router.push("/admin/tutorial")}>
                    Continue to Tutorial
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {formStep < 4 && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={formStep === 0}
                >
                  Back
                </Button>

                {formStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.agreeToTerms}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnboardingForm;
