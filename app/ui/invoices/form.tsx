"use client";
import { useEffect, useState } from "react";
import { CustomerField } from "@/app/lib/definitions";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import {
  afterFormSubmit,
  createInvoice,
  State,
  updateInvoice,
} from "@/app/lib/actions";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface IFormZustand {
  customerId: string;
  amount: string;
  status: string;
  updateCustomer: (value: string) => void;
  updateAmount: (value: string) => void;
  updateStatus: (value: string) => void;
  resetForm: () => void;
  setForm: (customerId: string, amount: string, status: string) => void;
}

const useFormZustand = create<IFormZustand>((set) => ({
  customerId: "",
  amount: "",
  status: "",
  updateCustomer: (value) => set({ customerId: value }),
  updateAmount: (value) => set({ amount: value }),
  updateStatus: (value) => set({ status: value }),
  resetForm: () => set({ customerId: "", amount: "", status: "" }),
  setForm: (customerId, amount, status) => set({ customerId, amount, status }),
}));

export default function Form({
  customers,
  type,
  invoice,
}: {
  customers: CustomerField[];
  type: string;
  invoice?: {
    amount: number;
    customer_id: string;
    id: string;
    status: string;
  };
}) {
  const {
    customerId,
    amount,
    status,
    updateCustomer,
    updateAmount,
    updateStatus,
    resetForm,
    setForm,
  } = useFormZustand(
    useShallow((state) => ({
      customerId: state.customerId,
      amount: state.amount,
      status: state.status,
      updateCustomer: state.updateCustomer,
      updateAmount: state.updateAmount,
      updateStatus: state.updateStatus,
      resetForm: state.resetForm,
      setForm: state.setForm,
    }))
  );

  useEffect(() => {
    if (type === "edit" && invoice) {
      setForm(invoice.customer_id, invoice.amount.toString(), invoice.status);
    } else if (type === "create") {
      resetForm();
    }
  }, [type, invoice, setForm]);

  const initialState: State = { message: null, errors: {} };
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    setIsLoading(true);
    const result = await createInvoice(state, {
      customerId,
      amount,
      status,
    });
    setIsLoading(false);
    if (result.successful) {
      resetForm();
      afterFormSubmit();
    } else {
      return setState(result);
    }
  }

  async function handleEdit() {
    setIsLoading(true);
    const result = await updateInvoice(invoice!.id, state, {
      customerId,
      amount,
      status,
    });
    setIsLoading(false);
    if (result.successful) {
      resetForm();
      afterFormSubmit();
    } else {
      return setState(result);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLoading) {
          if (type === "create") {
            handleCreate();
          } else if (type === "edit") {
            handleEdit();
          }
        }
      }}
    >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="customer-error"
              onChange={(event) => updateCustomer(event.target.value)}
              value={customerId}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => {
                return (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                );
              })}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
                value={amount}
                onChange={(event) => updateAmount(event.target.value)}
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount &&
              state.errors.amount.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                  onChange={() => updateStatus("pending")}
                  defaultChecked={(invoice?.status ?? status) === "pending"}
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                  onChange={() => updateStatus("paid")}
                  defaultChecked={(invoice?.status ?? status) === "paid"}
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">
          {type === "create" ? "Create" : "Edit"} Invoice
        </Button>
      </div>
    </form>
  );
}
