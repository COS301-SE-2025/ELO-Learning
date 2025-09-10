export default function QuestionFooter({
  isDisabled,
  isSubmitting,
  submitAnswer,
}) {
  return (
    <div className="flex fixed bottom-0 left-0 w-full z-10 px-4 py-4 bg-[#201F1F]">
      <div className="flex flex-col justify-center md:m-auto max-w-2xl mx-auto">
        <button
          type="button"
          disabled={isDisabled || isSubmitting}
          onClick={submitAnswer}
          data-cy="submit-answer"
          className={`w-full md:m-auto ${
            isDisabled || isSubmitting ? 'disabled_button' : 'main-button'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-3 rounded-full animate-spin mr-3"></div>
              SUBMITTING...
            </div>
          ) : (
            'SUBMIT'
          )}
        </button>
      </div>
    </div>
  );
}
