class LiveSearchChannel < ApplicationCable::Channel
  def subscribed
    stream_from "live_search"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
