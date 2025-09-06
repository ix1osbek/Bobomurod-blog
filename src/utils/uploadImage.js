import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (file) => {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("images") 
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error("Rasm yuklashda xatolik: " + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
