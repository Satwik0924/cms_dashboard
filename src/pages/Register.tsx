import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Building2, User, Mail, Globe, Shield, ArrowLeft } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  contactName: z.string().min(2, { message: "Contact name is required" }),
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  subdomain: z.string().min(3, { message: "Subdomain must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Subdomain can only contain lowercase letters, numbers, and hyphens" }),
  adminUsername: z.string().min(3, { message: "Username must be at least 3 characters" }),
  adminEmail: z.string().email({ message: "Please enter a valid email address" }),
  adminPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      subdomain: "",
      adminUsername: "",
      adminEmail: "",
      adminPassword: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('https://cmsapi.8views.net/api/auth/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      toast.success('🎉 Account created successfully! Welcome aboard!');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['companyName', 'contactName', 'contactEmail', 'subdomain'] 
      : ['adminUsername', 'adminEmail', 'adminPassword'];
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-lg relative z-10">
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 font-medium">
            Join thousands of businesses managing content with ease
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            } font-semibold text-sm transition-all duration-300`}>
              1
            </div>
            <div className={`w-16 h-1 rounded-full ${
              currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'
            } transition-all duration-300`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            } font-semibold text-sm transition-all duration-300`}>
              2
            </div>
          </div>
        </div>

        {/* Registration form */}
        <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              {currentStep === 1 ? 'Company Information' : 'Admin Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 
                ? 'Tell us about your business' 
                : 'Set up your administrator account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Company Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input 
                                placeholder="Acme Inc." 
                                {...field} 
                                disabled={isLoading}
                                className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">Contact Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input 
                                  placeholder="John Smith" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">Contact Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input 
                                  type="email" 
                                  placeholder="contact@example.com" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Subdomain</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input 
                                placeholder="yourcompany" 
                                {...field} 
                                disabled={isLoading}
                                className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                              />
                            </div>
                          </FormControl>
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-900">Administrator Account</h3>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        This account will have full control over your CMS
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="adminUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Admin Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input 
                                placeholder="admin" 
                                {...field} 
                                disabled={isLoading}
                                className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Admin Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input 
                                type="email" 
                                placeholder="admin@example.com" 
                                {...field} 
                                disabled={isLoading}
                                className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Admin Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                {...field} 
                                disabled={isLoading}
                                className="pl-10 pr-12 h-12 bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl font-medium placeholder:text-gray-400"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-600 mt-2">
                            🔒 Password must be at least 8 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  {currentStep === 1 ? (
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                        onClick={() => navigate('/login')}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        onClick={nextStep}
                        disabled={isLoading}
                      >
                        Continue
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                        onClick={prevStep}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                        type="submit" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}