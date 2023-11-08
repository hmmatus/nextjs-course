"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  try {

    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    console.log("🚀 ~ file: actions.ts:35 ~ createInvoice ~ error:", error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = InvoiceSchema.omit({ date: true });

// ...

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      id: id,
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });
  
    const amountInCents = amount * 100;
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.log("🚀 ~ file: actions.ts:64 ~ updateInvoice ~ error:", error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
  } catch (error) {
    console.log("🚀 ~ file: actions.ts:74 ~ deleteInvoice ~ error:", error);
  }
}
