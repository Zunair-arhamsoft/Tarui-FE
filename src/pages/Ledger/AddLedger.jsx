import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { ledgerSchema } from "../../validation-schema/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { clearLedgerState, createLedger } from "../../redux/slices/ledgerSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function AddLedger() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.ledger);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ledgerSchema),
  });

  const onSubmit = (data) => {
    dispatch(createLedger(data));
  };

  useEffect(() => {
    if (success) {
      dispatch(clearLedgerState());
      toast.success(success);
      reset();
      navigate("/ledger");
    }
    if (error) {
      toast.error(error);
      dispatch(clearLedgerState());
    }
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      {loading && <Loader />}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            to="/ledger"
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-all group mr-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Create New Ledger
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ledger Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 text-white placeholder-gray-400 transition-all outline-none"
                placeholder="e.g. Hassaan Baig"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-pink-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Detail
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 text-white placeholder-gray-400 transition-all outline-none"
                placeholder="Customer's Address And Phone Number"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-pink-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Create Ledger</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
