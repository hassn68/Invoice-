import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type LineItemFormData } from "./invoice-form";

interface LineItemRowProps {
  item: LineItemFormData;
  index: number;
  onUpdate: (index: number, field: keyof LineItemFormData, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function LineItemRow({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  canRemove 
}: LineItemRowProps) {
  const amount = item.quantity * item.rate;

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border border-slate-200 rounded-lg">
      <div className="col-span-12 md:col-span-5">
        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
        <Input
          placeholder="Service description"
          value={item.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          data-testid={`input-description-${index}`}
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value) || 1)}
          data-testid={`input-quantity-${index}`}
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Rate</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={item.rate}
          onChange={(e) => onUpdate(index, "rate", parseFloat(e.target.value) || 0)}
          data-testid={`input-rate-${index}`}
        />
      </div>
      <div className="col-span-3 md:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
        <div className="h-10 flex items-center text-sm font-medium text-slate-900" data-testid={`amount-${index}`}>
          ${amount.toFixed(2)}
        </div>
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-medium text-slate-500 mb-1">&nbsp;</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="text-red-600 hover:text-red-800 h-10 w-10 p-0"
          data-testid={`button-remove-item-${index}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
