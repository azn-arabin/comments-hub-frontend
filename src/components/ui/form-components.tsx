import { Info } from "lucide-react";
import type { FieldError, RegisterOptions, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormLabelProps {
  for?: string;
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

export const FormLabel = (props: FormLabelProps) => (
  <div className="flex items-center gap-1">
    <Label htmlFor={props.for} className={props.className}>
      {props.children}
      {!!props.required && <span className="ml-1 text-red-500">*</span>}
    </Label>
    {props.tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm">
            {props.tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export const FormError = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-red-500">{children}</p>
);

interface FormInputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  className?: string;
  validators?: RegisterOptions;
  min?: string;
  tooltip?: string;
  disabled?: boolean;
  step?: string | number;
}

export const FormInputWithLabel = ({
  name,
  label,
  placeholder,
  type = "text",
  error,
  register,
  className,
  validators,
  min,
  tooltip,
  disabled,
  step,
}: FormInputWithLabelProps) => {
  return (
    <div className="space-y-2">
      <FormLabel tooltip={tooltip} for={name} required={!!validators?.required}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, validators)}
        className={cn(error && "border-red-500", className)}
        min={min}
        disabled={disabled}
        step={step}
      />
      {error && <FormError>{error.message}</FormError>}
    </div>
  );
};

interface FormTextAreaWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  className?: string;
  validators?: RegisterOptions;
  tooltip?: string;
  disabled?: boolean;
}

export const FormTextAreaWithLabel = ({
  name,
  label,
  placeholder,
  error,
  register,
  className,
  validators,
  tooltip,
  disabled,
}: FormTextAreaWithLabelProps) => {
  return (
    <div className="space-y-2">
      <FormLabel tooltip={tooltip} for={name} required={!!validators?.required}>
        {label}
      </FormLabel>
      <Textarea
        id={name}
        placeholder={placeholder}
        {...register(name, validators)}
        className={cn(error && "border-red-500", className)}
        disabled={disabled}
      />
      {error && <FormError>{error.message}</FormError>}
    </div>
  );
};
