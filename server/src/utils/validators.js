// server/src/utils/validators.js
const Joi = require('joi');

/**
 * Validator untuk registrasi user
 */
const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.min': 'Password minimal 8 karakter',
      'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
      'any.required': 'Password wajib diisi'
    }),
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama minimal 3 karakter',
      'string.max': 'Nama maksimal 255 karakter',
      'any.required': 'Nama wajib diisi'
    }),
  role: Joi.string()
    .valid(
      'superadmin',
      'head_consultant',
      'project_lead',
      'admin_lead',
      'inspektor',
      'drafter',
      'klien'
    )
    .required()
    .messages({
      'any.only': 'Role tidak valid',
      'any.required': 'Role wajib diisi'
    }),
  phone: Joi.string()
    .pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Nomor telepon tidak valid'
    }),
  company: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Nama perusahaan maksimal 255 karakter'
    })
});

/**
 * Validator untuk login user
 */
const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password wajib diisi'
    })
});

/**
 * Validator untuk pembuatan proyek
 */
const projectCreationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama proyek minimal 3 karakter',
      'string.max': 'Nama proyek maksimal 255 karakter',
      'any.required': 'Nama proyek wajib diisi'
    }),
  owner_name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Nama pemilik minimal 3 karakter',
      'string.max': 'Nama pemilik maksimal 255 karakter',
      'any.required': 'Nama pemilik wajib diisi'
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'Alamat wajib diisi'
    }),
  building_function: Joi.string()
    .valid(
      'rumah_tinggal',
      'gedung_kantor',
      'mall_perbelanjaan',
      'rumah_sakit',
      'sekolah',
      'hotel',
      'apartemen',
      'industri',
      'gudang',
      'terminal',
      'bandara',
      'pelabuhan',
      'tempat_ibadah',
      'tempat_rekreasi',
      'fasilitas_umum'
    )
    .required()
    .messages({
      'any.only': 'Fungsi bangunan tidak valid',
      'any.required': 'Fungsi bangunan wajib diisi'
    }),
  floors: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.integer': 'Jumlah lantai harus bilangan bulat',
      'number.min': 'Jumlah lantai minimal 1',
      'number.max': 'Jumlah lantai maksimal 100',
      'any.required': 'Jumlah lantai wajib diisi'
    }),
  height: Joi.number()
    .precision(2)
    .min(1)
    .max(500)
    .optional()
    .messages({
      'number.precision': 'Tinggi bangunan maksimal 2 angka desimal',
      'number.min': 'Tinggi bangunan minimal 1 meter',
      'number.max': 'Tinggi bangunan maksimal 500 meter'
    }),
  area: Joi.number()
    .precision(2)
    .min(1)
    .max(1000000)
    .optional()
    .messages({
      'number.precision': 'Luas bangunan maksimal 2 angka desimal',
      'number.min': 'Luas bangunan minimal 1 m²',
      'number.max': 'Luas bangunan maksimal 1.000.000 m²'
    }),
  location: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Lokasi maksimal 500 karakter'
    }),
  coordinates: Joi.string()
    .pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Koordinat tidak valid (format: latitude,longitude)'
    }),
  request_type: Joi.string()
    .valid(
      'baru',
      'perpanjangan_slf',
      'perubahan_fungsi',
      'pascabencana'
    )
    .required()
    .messages({
      'any.only': 'Jenis permohonan tidak valid',
      'any.required': 'Jenis permohonan wajib diisi'
    }),
  project_lead_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID project lead harus bilangan bulat'
    }),
  client_id: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'ID klien harus bilangan bulat'
    })
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  projectCreationSchema
};