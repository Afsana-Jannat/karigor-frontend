'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LoaderCircle, User, LogOut, ShieldAlert, Trash2 } from 'lucide-react';
import { useSession } from '@/lib/session/use-session';
import { updateMyProfile, logoutEverywhere, deleteMyAccount } from '../api';
import { updateNameSchema, deleteAccountSchema, UpdateNameValues, DeleteAccountValues } from '../schemas';
import { getErrorMessage } from '@/lib/apiClient';
import { roleLabels } from '@/lib/labels';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isSessionLoading } = useSession();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Profile Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateNameValues) => updateMyProfile(data),
    onSuccess: () => {
      toast.success('প্রোফাইলের নাম সফলভাবে আপডেট করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Logout Everywhere Mutation
  const logoutAllMutation = useMutation({
    mutationFn: logoutEverywhere,
    onSuccess: () => {
      toast.success('সকল ডিভাইস থেকে সফলভাবে লগআউট করা হয়েছে');
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Delete Account Mutation
  const deleteMutation = useMutation({
    mutationFn: (confirmText: string) => deleteMyAccount(confirmText),
    onSuccess: () => {
      toast.success('আপনার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে');
      queryClient.clear();
      router.push('/');
    },
    onError: (error) => {
      const message = getErrorMessage(error, {
        CONFLICT: 'আগে চলমান কাজ শেষ বা বাতিল করুন',
      });
      toast.error(message);
    },
  });

  const nameForm = useForm({
    defaultValues: {
      name: user?.name || '',
    } as UpdateNameValues,
    validators: {
      onChange: updateNameSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  const deleteForm = useForm({
    defaultValues: {
      confirmText: '',
    } as { confirmText: string },
    validators: {
      onChange: deleteAccountSchema,
    },
    onSubmit: async ({ value }) => {
      deleteMutation.mutate(value.confirmText);
    },
  });

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand">অ্যাকাউন্ট সেটিংস</h1>
        <p className="text-sm text-slate-500 mt-1">আপনার ব্যক্তিগত তথ্য এবং সিকিউরিটি ম্যানেজ করুন।</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-brand flex items-center justify-center font-bold text-xl">
            {user?.name?.[0] || 'উ'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.phone}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {roleLabels[user?.role as keyof typeof roleLabels] || user?.role}
            </span>
          </div>
        </div>

        {/* Name Edit Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nameForm.handleSubmit();
          }}
          className="space-y-4 pt-4 border-t"
        >
          <nameForm.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">নাম পরিবর্তন করুন</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5"
                />
                {field.state.meta.errors ? (
                  <p className="text-xs text-red-600 font-medium">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          </nameForm.Field>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-11 px-5 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-dark transition flex items-center gap-2"
          >
            {updateMutation.isPending && <LoaderCircle size={16} className="animate-spin" />}
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      </div>

      {/* Security & Sessions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">সিকিউরিটি ও সেশন</h3>
        <p className="text-sm text-slate-500">আপনার সমস্তভুত সেশন বা ডিভাইস থেকে এক সাথে লগআউট করতে পারেন।</p>

        <button
          onClick={() => logoutAllMutation.mutate()}
          disabled={logoutAllMutation.isPending}
          className="h-11 px-5 rounded-xl border border-slate-200 bg-white font-semibold text-brand text-sm hover:bg-slate-50 transition flex items-center gap-2"
        >
          {logoutAllMutation.isPending && <LoaderCircle size={16} className="animate-spin text-brand" />}
          <LogOut size={16} />
          সকল ডিভাইস থেকে লগআউট করুন
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/40 p-6 rounded-3xl border border-red-100 space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <ShieldAlert size={20} />
          <h3 className="text-lg font-bold">ডেঞ্জার জোন</h3>
        </div>
        <p className="text-sm text-slate-600">
          অ্যাকাউন্ট ডিলিট করলে আপনার সমস্ত তথ্য মুছে যাবে। (চলমান কাজ থাকলে তা আগে শেষ বা বাতিল করতে হবে[cite: 16, 21, 36]).
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="h-11 px-5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition flex items-center gap-2"
        >
          <Trash2 size={16} />
          অ্যাকাউন্ট ডিলিট করুন
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-lg font-extrabold text-red-600">আপনি কি অ্যাকাউন্ট ডিলিট করতে চান?</h3>
            <p className="text-sm text-slate-600">
              নিশ্চিত করতে নিচে ইংরেজিতে বড় হাতের অক্ষরে <strong className="text-slate-900">DELETE</strong> লিখুন:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <deleteForm.Field name="confirmText">
                {(field) => (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="DELETE লিখুন"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-600"
                    />
                    {field.state.meta.errors ? (
                      <p className="text-xs text-red-600 font-medium">{field.state.meta.errors.join(', ')}</p>
                    ) : null}
                  </div>
                )}
              </deleteForm.Field>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending && <LoaderCircle size={16} className="animate-spin" />}
                  স্থায়ীভাবে মুছুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}