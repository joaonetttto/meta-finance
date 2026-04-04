import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  /** Raw numeric value (e.g. 1234.56) */
  value: string;
  /** Called with the raw numeric string (e.g. "1234.56") */
  onValueChange: (raw: string) => void;
  prefix?: string;
}

function formatBRL(raw: string): string {
  // Remove tudo que não for dígito
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Tratar como centavos: "123456" => 1234.56
  const cents = BigInt(digits);
  const intPart = (cents / 100n).toString();
  const decPart = (cents % 100n).toString().padStart(2, "0");

  // Adicionar pontos de milhar
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formatted},${decPart}`;
}

function toRawValue(digits: string): string {
  if (!digits) return "";
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "";
  const cents = BigInt(clean);
  const intPart = (cents / 100n).toString();
  const decPart = (cents % 100n).toString().padStart(2, "0");
  return `${intPart}.${decPart}`;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, prefix = "R$ ", ...props }, ref) => {
    // Convert raw value (e.g. "1234.56") to display digits
    const toDisplay = (raw: string): string => {
      if (!raw) return "";
      const num = parseFloat(raw);
      if (isNaN(num)) return "";
      // Convert to cents string
      const cents = Math.round(num * 100).toString();
      return formatBRL(cents);
    };

    const [display, setDisplay] = React.useState(() => toDisplay(value));

    React.useEffect(() => {
      setDisplay(toDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value.replace(/[^\d]/g, "");
      if (!inputVal) {
        setDisplay("");
        onValueChange("");
        return;
      }
      setDisplay(formatBRL(inputVal));
      onValueChange(toRawValue(inputVal));
    };

    return (
      <div className="relative">
        {display && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            display && "pl-10",
            className
          )}
          value={display}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
