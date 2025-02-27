import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: File, bucket: string = "products") {
  console.log(`file upload. file:${file}, bucket: ${bucket}`);
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl.publicUrl, fileName };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(
  fileName: string,
  bucket: string = "products"
) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
